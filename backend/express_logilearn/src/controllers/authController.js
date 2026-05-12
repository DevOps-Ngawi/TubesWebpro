const response = require('../helpers/response');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const loginAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return response(400, null, "Username dan password wajib diisi", res);
    }

    const admin = await prisma.admins.findFirst({
      where: { username: username }
    });

    if (!admin) {
      return response(404, null, "Admin Atau Password salah", res);
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return response(401, null, "Password salah", res);
    }

    const token = jwt.sign(
      { id: admin.id, username: admin.username, type: "ADMIN" },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    const dataLogin = {
      token: token,
      admin: {
        id: admin.id,
        nama: admin.nama,
        username: admin.username
      }
    };

    return response(200, dataLogin, "Login Admin Berhasil", res);

  } catch (error) {
    return response(500, null, `Terjadi kesalahan server: ${error.message}`, res);
  }
};

const loginPelajar = async (req, res) => {
  try {
    const { username, password } = req.body;

    const pelajar = await prisma.pelajars.findFirst({
      where: { username: username }
    });

    if (!pelajar) {
      return response(404, null, "Pelajar tidak ditemukan", res);
    }

    const isPasswordValid = await bcrypt.compare(password, pelajar.password);
    if (!isPasswordValid) {
      return response(401, null, "Password salah", res);
    }

    const token = jwt.sign(
      { id: pelajar.id, username: pelajar.username, type: "PELAJAR" },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    const dataLogin = {
      token: token,
      pelajar: { id: pelajar.id, nama: pelajar.nama }
    };

    return response(200, dataLogin, "Login Berhasil", res);

  } catch (error) {
    return response(500, null, `Terjadi kesalahan server: ${error.message}`, res);
  }
};

const registerPelajar = async (req, res) => {
  try {
    const { nama, username, password } = req.body;

    if (!nama || !username || !password) {
      return response(400, null, "Nama, Username, dan Password wajib diisi", res);
    }

    const existingPelajar = await prisma.pelajars.findFirst({
      where: { username: username }
    });

    if (existingPelajar) {
      return response(400, null, "Username sudah digunakan, silakan pilih yang lain", res);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newPelajar = await prisma.pelajars.create({
      data: {
        nama,
        username,
        password: hashedPassword,
      },
    });

    const dataRegister = {
      id: newPelajar.id,
      nama: newPelajar.nama,
      username: newPelajar.username
    };

    return response(201, dataRegister, "Registrasi Berhasil", res);

  } catch (error) {
    console.error("Register Error:", error);
    return response(500, null, `Terjadi kesalahan server: ${error.message}`, res);
  }
};

module.exports = {
  loginAdmin,
  loginPelajar,
  registerPelajar
};