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
const uploadsPath = path.join(__dirname, "uploads");
const categoriasPath = path.join(__dirname, "uploads", "categorias");

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

const flyersPath = path.join(__dirname, "uploads", "flyers");

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

const productosPath = path.join(__dirname, "uploads", "productos");

if (!fs.existsSync(productosPath)) {
  fs.mkdirSync(productosPath, { recursive: true });
}

const storageProductos = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, productosPath);
  },
  filename: (req, file, cb) => {
    const nombreArchivo =
      Date.now() + "-" + file.originalname.replace(/\s+/g, "-");

    cb(null, nombreArchivo);
  },
});

const uploadProducto = multer({
  storage: storageProductos,
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

    const [rows] = await db.query(`
      SELECT 
        productos.*,
        categorias.nombre AS categoria
      FROM productos
      LEFT JOIN categorias
      ON productos.categoria_id = categorias.id
      WHERE productos.id = ?
    `, [id]);

    if (rows.length === 0) {
      return res.status(404).json({
        message: "Producto no encontrado"
      });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json(error);
  }
});

app.post("/productos", uploadProducto.array("imagenes", 6), async (req, res) => {
  try {
    const {
      nombre,
      precio,
      descripcion,
      categoria_id,
      marca,
      stock,
      sku,
      tallas,
      usa_tallas,
      tipo_talla,
      usa_colores,
      colores,
    } = req.body;

    if (!nombre || !precio || !descripcion || !categoria_id || !stock) {
      return res.status(400).json({
        message: "Faltan campos obligatorios",
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        message: "Debes subir mínimo una imagen",
      });
    }

    const imagenPrincipal = `uploads/productos/${req.files[0].filename}`;

    const imagenes = req.files.map(file => {
      return `uploads/productos/${file.filename}`;
    });

    const [result] = await db.query(
      `INSERT INTO productos 
      (
        nombre, precio, descripcion, imagen, imagenes,
        categoria_id, marca, stock, sku, tallas,
        usa_tallas, tipo_talla, usa_colores, colores
      ) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        nombre,
        precio,
        descripcion,
        imagenPrincipal,
        JSON.stringify(imagenes),
        categoria_id,
        marca || "",
        stock,
        sku || "",
        tallas || "[]",
        usa_tallas || 0,
        tipo_talla || "",
        usa_colores || 0,
        colores || "[]",
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
      marca,
      stock,
      sku,
      tallas,
      usa_tallas,
      tipo_talla,
      usa_colores,
      colores,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json(error);
  }
});

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

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});