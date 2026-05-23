const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

// Carpetas
const publicPath = path.join(__dirname, "public");
const uploadsPath = process.env.UPLOAD_DIR || path.join(__dirname, "uploads");

const categoriasPath = path.join(uploadsPath, "categorias");
const flyersPath = path.join(uploadsPath, "flyers");
const productosPath = path.join(uploadsPath, "productos");
const comprobantesPath = path.join(uploadsPath, "comprobantes");

[
  uploadsPath,
  categoriasPath,
  flyersPath,
  productosPath,
  comprobantesPath
].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Crear carpeta uploads/categorias si no existe
if (!fs.existsSync(categoriasPath)) {
  fs.mkdirSync(categoriasPath, { recursive: true });
}

// Archivos estáticos
app.use(express.static(publicPath));
app.use("/uploads", express.static(uploadsPath));

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME,
});

// Páginas
app.get("/", (req, res) => {
  res.sendFile(path.join(publicPath, "index.html"));
});

app.get("/admin", (req, res) => {
  res.sendFile(path.join(publicPath, "admin.html"));
});

/* =========================
   FLYERS
========================= */

if (!fs.existsSync(flyersPath)) {
  fs.mkdirSync(flyersPath, { recursive: true });
}

const storageFlyers = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, flyersPath);
  },
  filename: (req, file, cb) => {
    const nombreArchivo =
      Date.now() + "-" + file.originalname.replace(/\s+/g, "-");

    cb(null, nombreArchivo);
  },
});

const uploadFlyer = multer({
  storage: storageFlyers,
});

app.get("/flyers", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM flyers ORDER BY id DESC");
    res.json(rows);
  } catch (error) {
    res.status(500).json(error);
  }
});

app.post("/flyers", uploadFlyer.single("imagen"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "La imagen es obligatoria",
      });
    }

    const imagen = `uploads/flyers/${req.file.filename}`;

    const [result] = await db.query(
      "INSERT INTO flyers(imagen) VALUES (?)",
      [imagen]
    );

    res.json({
      id: result.insertId,
      imagen,
    });
  } catch (error) {
    res.status(500).json(error);
  }
});

app.delete("/flyers/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await db.query("DELETE FROM flyers WHERE id = ?", [id]);

    res.json({
      message: "Flyer eliminado correctamente",
    });
  } catch (error) {
    res.status(500).json(error);
  }
});

app.put("/flyers/:id", uploadFlyer.single("imagen"), async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.file) {
      return res.status(400).json({
        message: "Debes subir una imagen"
      });
    }

    const imagen = `uploads/flyers/${req.file.filename}`;

    await db.query(
      "UPDATE flyers SET imagen = ? WHERE id = ?",
      [imagen, id]
    );

    res.json({
      message: "Flyer actualizado correctamente"
    });
  } catch (error) {
    console.error(error);
    res.status(500).json(error);
  }
});

/* =========================
   MULTER CATEGORÍAS
========================= */

const storageCategorias = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, categoriasPath);
  },
  filename: (req, file, cb) => {
    const nombreArchivo =
      Date.now() + "-" + file.originalname.replace(/\s+/g, "-");

    cb(null, nombreArchivo);
  },
});

const uploadCategoria = multer({
  storage: storageCategorias,
});

/* =========================
   CATEGORÍAS
========================= */

app.get("/categorias", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM categorias ORDER BY id DESC");
    res.json(rows);
  } catch (error) {
    res.status(500).json(error);
  }
});

app.post("/categorias", uploadCategoria.single("imagen"), async (req, res) => {
  try {
    const { nombre } = req.body;

    if (!nombre || !req.file) {
      return res.status(400).json({
        message: "Nombre e imagen son obligatorios",
      });
    }

    const imagen = `uploads/categorias/${req.file.filename}`;

    const [result] = await db.query(
      "INSERT INTO categorias(nombre, imagen) VALUES (?, ?)",
      [nombre, imagen]
    );

    res.json({
      id: result.insertId,
      nombre,
      imagen,
    });
  } catch (error) {
    res.status(500).json(error);
  }
});

app.put("/categorias/:id", uploadCategoria.single("imagen"), async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre } = req.body;

    let query = "UPDATE categorias SET nombre = ? WHERE id = ?";
    let values = [nombre, id];

    if (req.file) {
      const imagen = `uploads/categorias/${req.file.filename}`;
      query = "UPDATE categorias SET nombre = ?, imagen = ? WHERE id = ?";
      values = [nombre, imagen, id];
    }

    await db.query(query, values);

    res.json({
      message: "Categoría actualizada correctamente"
    });
  } catch (error) {
    console.error(error);
    res.status(500).json(error);
  }
});

/*==========================
   ELIMINAR CATEGORIA
========================= */

app.delete("/categorias/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [categoria] = await db.query(
      "SELECT imagen FROM categorias WHERE id = ?",
      [id]
    );

    if (categoria.length === 0) {
      return res.status(404).json({
        message: "Categoría no encontrada",
      });
    }

    await db.query("DELETE FROM categorias WHERE id = ?", [id]);

    res.json({
      message: "Categoría eliminada correctamente",
    });
  } catch (error) {
    res.status(500).json(error);
  }
});

/* =========================
   PRODUCTOS
========================= */

if (!fs.existsSync(productosPath)) {
  fs.mkdirSync(productosPath, { recursive: true });
}

const storageProducto = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, productosPath);
  },
  filename: (req, file, cb) => {
    const nombreArchivo = Date.now() + "-" + file.originalname.replace(/\s+/g, "-");
    cb(null, nombreArchivo);
  },
});

const uploadProducto = multer({
  storage: storageProducto,
  limits: {
    fileSize: 20 * 1024 * 1024,
  },
});

app.get("/productos", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        productos.*,
        categorias.nombre AS categoria
      FROM productos
      LEFT JOIN categorias
      ON productos.categoria_id = categorias.id
      ORDER BY productos.id DESC
    `);

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json(error);
  }
});

app.get("/productos/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query(
      `
      SELECT 
        productos.*,
        categorias.nombre AS categoria
      FROM productos
      LEFT JOIN categorias
      ON productos.categoria_id = categorias.id
      WHERE productos.id = ?
      `,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        message: "Producto no encontrado",
      });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json(error);
  }
});


app.post(
  "/productos",
  uploadProducto.fields([
    { name: "imagenes", maxCount: 6 },
  ]),
  async (req, res) => {
    try {
      const {
        nombre,
        precio,
        descripcion,
        categoria_id,
        marca,
        variantes,
        tipo_producto
      } = req.body;

      if (!nombre || !precio || !descripcion || !categoria_id || !variantes) {
        return res.status(400).json({
          message: "Faltan campos obligatorios",
          recibido: req.body
        });
      }

      const imagenesFiles = req.files?.imagenes || [];

      if (imagenesFiles.length === 0) {
        return res.status(400).json({
          message: "Debes subir mínimo una imagen",
        });
      }

      const imagenPrincipal = `uploads/productos/${imagenesFiles[0].filename}`;

      const imagenes = imagenesFiles.map(file => {
        return `uploads/productos/${file.filename}`;
      });

      const [result] = await db.query(
        `INSERT INTO productos 
        (
          nombre, precio, descripcion, imagen, imagenes,
          categoria_id, marca, variantes, tipo_producto
        ) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          nombre,
          precio,
          descripcion,
          imagenPrincipal,
          JSON.stringify(imagenes),
          categoria_id,
          marca || "",
          variantes,
          tipo_producto || "normal"
        ]
      );

      res.json({
        id: result.insertId,
        nombre,
        precio,
        descripcion,
        imagen: imagenPrincipal,
        imagenes,
        categoria_id,
        marca: marca || "",
        variantes,
        tipo_producto: tipo_producto || "normal"
      });

    } catch (error) {
      console.error("ERROR REAL:", error);

      res.status(500).json({
        message: error.message,
        sqlMessage: error.sqlMessage,
        code: error.code
      });
    }
  }
);


app.delete("/productos/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [producto] = await db.query(
      "SELECT imagen, imagenes FROM productos WHERE id = ?",
      [id]
    );

    if (producto.length === 0) {
      return res.status(404).json({
        message: "Producto no encontrado",
      });
    }

    await db.query("DELETE FROM productos WHERE id = ?", [id]);

    res.json({
      message: "Producto eliminado correctamente",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json(error);
  }
});

app.put("/productos/:id", uploadProducto.array("imagenes", 6), async (req, res) => {
  try {
    const { id } = req.params;

    const {
      nombre,
      precio,
      descripcion,
      categoria_id,
      marca,
      variantes,
      tipo_producto
    } = req.body;

    if (!nombre || !precio || !descripcion || !categoria_id || !variantes) {
      return res.status(400).json({
        message: "Faltan campos obligatorios",
        recibido: req.body
      });
    }

    let imagenPrincipal = req.body.imagenActual || "";
    let imagenes = req.body.imagenesActuales || "[]";

    if (req.files && req.files.length > 0) {
      const nuevasImagenes = req.files.map(file => `uploads/productos/${file.filename}`);
      imagenPrincipal = nuevasImagenes[0];
      imagenes = JSON.stringify(nuevasImagenes);
    }

    await db.query(
      `UPDATE productos SET
        nombre = ?,
        precio = ?,
        descripcion = ?,
        imagen = ?,
        imagenes = ?,
        categoria_id = ?,
        marca = ?,
        variantes = ?,
        tipo_producto = ?
      WHERE id = ?`,
      [
        nombre,
        precio,
        descripcion,
        imagenPrincipal,
        imagenes,
        categoria_id,
        marca || "",
        variantes,
        tipo_producto || "normal",
        id
      ]
    );

    res.json({
      message: "Producto actualizado correctamente"
    });

  } catch (error) {
    console.error("ERROR REAL:", error);

    res.status(500).json({
      message: error.message,
      sqlMessage: error.sqlMessage,
      code: error.code
    });
  }
});
/* =========================
   PEDIDOS
========================= */

const storageComprobantes = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, comprobantesPath);
  },
  filename: (req, file, cb) => {
    const nombreArchivo = Date.now() + "-" + file.originalname.replace(/\s+/g, "-");
    cb(null, nombreArchivo);
  }
});

const uploadComprobante = multer({
  storage: storageComprobantes
});

app.post("/pedidos", uploadComprobante.single("comprobante"), async (req, res) => {
  try {
    const {
      nombre,
      whatsapp,
      correo,
      direccion,
      ciudad,
      metodo_pago,
      productos,
      total,
      moneda,
      notas
    } = req.body;

    if (!nombre || !whatsapp || !direccion || !ciudad || !metodo_pago || !productos || !total) {
      return res.status(400).json({
        message: "Faltan campos obligatorios",
        recibido: req.body,
        archivos: req.files
      });
    }

    const comprobante = req.file
      ? `uploads/comprobantes/${req.file.filename}`
      : null;

    const [result] = await db.query(
      `INSERT INTO pedidos
      (
        nombre, whatsapp, correo, direccion, ciudad,
        metodo_pago, comprobante, productos, total, moneda, notas
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        nombre,
        whatsapp,
        correo || "",
        direccion,
        ciudad,
        metodo_pago,
        comprobante,
        productos,
        total,
        moneda || "COP",
        notas || ""
      ]
    );

    res.json({
      id: result.insertId,
      message: "Pedido creado correctamente"
    });

  } catch (error) {
    console.error(error);
    res.status(500).json(error);
  }
});

app.get("/pedidos", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT *
      FROM pedidos
      ORDER BY id DESC
    `);

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json(error);
  }
});

app.put("/pedidos/:id/estado", async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    const estadosPermitidos = ["Activo", "Revisado", "En camino", "Entregado"];

    if (!estadosPermitidos.includes(estado)) {
      return res.status(400).json({
        message: "Estado no válido"
      });
    }

    await db.query(
      "UPDATE pedidos SET estado = ? WHERE id = ?",
      [estado, id]
    );

    res.json({
      message: "Estado actualizado correctamente",
      estado
    });

  } catch (error) {
    console.error(error);
    res.status(500).json(error);
  }
});

app.delete("/pedidos/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await db.query(
      "DELETE FROM pedidos WHERE id = ?",
      [id]
    );

    res.json({
      message: "Pedido eliminado correctamente"
    });

  } catch (error) {
    console.error("Error al eliminar pedido:", error);

    res.status(500).json({
      message: "No se pudo eliminar el pedido",
      error: error.message
    });
  }
});
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});