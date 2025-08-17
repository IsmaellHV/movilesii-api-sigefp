const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { executeQuery } = require('../config/database');

// Generar token JWT
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );
};

// Registro de usuario
const register = async (req, res) => {
  try {
    const { nombreUsuario, apellidoUsuario, correoUsuario, passwordUsuario } = req.body;

    // Verificar si el usuario ya existe
    const existingUser = await executeQuery(
      'SELECT idUsuario FROM USUARIO WHERE correoUsuario = ?',
      [correoUsuario]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'El correo electrónico ya está registrado'
      });
    }

    // Encriptar contraseña
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(passwordUsuario, saltRounds);

    // Insertar nuevo usuario
    const result = await executeQuery(
      'INSERT INTO USUARIO (nombreUsuario, apellidoUsuario, correoUsuario, passwordUsuario) VALUES (?, ?, ?, ?)',
      [nombreUsuario, apellidoUsuario, correoUsuario, hashedPassword]
    );

    // Generar token
    const token = generateToken(result.insertId);

    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      data: {
        user: {
          id: result.insertId,
          nombre: nombreUsuario,
          apellido: apellidoUsuario,
          correo: correoUsuario
        },
        token
      }
    });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

// Login de usuario
const login = async (req, res) => {
  try {
    const { correoUsuario, passwordUsuario } = req.body;

    // Buscar usuario por correo
    const users = await executeQuery(
      'SELECT idUsuario, nombreUsuario, apellidoUsuario, correoUsuario, passwordUsuario FROM USUARIO WHERE correoUsuario = ?',
      [correoUsuario]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Credenciales inválidas'
      });
    }

    const user = users[0];

    // Verificar contraseña
    const isPasswordValid = await bcrypt.compare(passwordUsuario, user.passwordUsuario);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Credenciales inválidas'
      });
    }

    // Generar token
    const token = generateToken(user.idUsuario);

    res.json({
      success: true,
      message: 'Login exitoso',
      data: {
        user: {
          id: user.idUsuario,
          nombre: user.nombreUsuario,
          apellido: user.apellidoUsuario,
          correo: user.correoUsuario
        },
        token
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

// Obtener perfil del usuario autenticado
const getProfile = async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        user: req.user
      }
    });
  } catch (error) {
    console.error('Error obteniendo perfil:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

// Cambiar contraseña
const changePassword = async (req, res) => {
  try {
    const { passwordActual, passwordNueva } = req.body;
    const userId = req.user.id;

    // Obtener contraseña actual del usuario
    const users = await executeQuery(
      'SELECT passwordUsuario FROM USUARIO WHERE idUsuario = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado'
      });
    }

    // Verificar contraseña actual
    const isCurrentPasswordValid = await bcrypt.compare(passwordActual, users[0].passwordUsuario);

    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        error: 'La contraseña actual es incorrecta'
      });
    }

    // Encriptar nueva contraseña
    const saltRounds = 12;
    const hashedNewPassword = await bcrypt.hash(passwordNueva, saltRounds);

    // Actualizar contraseña
    await executeQuery(
      'UPDATE USUARIO SET passwordUsuario = ? WHERE idUsuario = ?',
      [hashedNewPassword, userId]
    );

    res.json({
      success: true,
      message: 'Contraseña actualizada exitosamente'
    });
  } catch (error) {
    console.error('Error cambiando contraseña:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

// Refrescar token
const refreshToken = async (req, res) => {
  try {
    const userId = req.user.id;

    // Generar nuevo token
    const newToken = generateToken(userId);

    res.json({
      success: true,
      message: 'Token refrescado exitosamente',
      data: {
        token: newToken
      }
    });
  } catch (error) {
    console.error('Error refrescando token:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  changePassword,
  refreshToken
};