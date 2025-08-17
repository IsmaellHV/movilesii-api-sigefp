-- =====================================================
-- DATOS DE PRUEBA - Sistema de Gestión Financiera
-- =====================================================

-- Limpiar datos existentes (opcional)
-- DELETE FROM GASTO;
-- DELETE FROM INGRESO;
-- DELETE FROM TIPO;
-- DELETE FROM USUARIO;

-- =====================================================
-- INSERTAR TIPOS/CATEGORÍAS
-- =====================================================

-- Tipos de Ingreso
INSERT INTO TIPO (nombreTipo, categoria) VALUES 
('Salario', 'Ingreso'),
('Freelance', 'Ingreso'),
('Inversiones', 'Ingreso'),
('Bonificación', 'Ingreso'),
('Venta', 'Ingreso'),
('Dividendos', 'Ingreso');

-- Tipos de Gasto
INSERT INTO TIPO (nombreTipo, categoria) VALUES 
('Alimentación', 'Gasto'),
('Transporte', 'Gasto'),
('Entretenimiento', 'Gasto'),
('Servicios Básicos', 'Gasto'),
('Salud', 'Gasto'),
('Educación', 'Gasto'),
('Ropa', 'Gasto'),
('Hogar', 'Gasto'),
('Tecnología', 'Gasto'),
('Viajes', 'Gasto');

-- Métodos de Pago
INSERT INTO TIPO (nombreTipo, categoria) VALUES 
('Efectivo', 'MetodoPago'),
('Tarjeta de Crédito', 'MetodoPago'),
('Tarjeta de Débito', 'MetodoPago'),
('Transferencia Bancaria', 'MetodoPago'),
('PayPal', 'MetodoPago'),
('Yape', 'MetodoPago'),
('Plin', 'MetodoPago');

-- =====================================================
-- INSERTAR USUARIOS DE PRUEBA
-- =====================================================

INSERT INTO USUARIO (nombreUsuario, apellidoUsuario, correoUsuario, passwordUsuario) VALUES 
('Juan', 'Pérez', 'juan.perez@email.com', '$2b$10$rOzJqKqQxQxQxQxQxQxQxO'),  -- password: 123456
('María', 'García', 'maria.garcia@email.com', '$2b$10$rOzJqKqQxQxQxQxQxQxQxO'),  -- password: 123456
('Carlos', 'López', 'carlos.lopez@email.com', '$2b$10$rOzJqKqQxQxQxQxQxQxQxO'),  -- password: 123456
('Ana', 'Martínez', 'ana.martinez@email.com', '$2b$10$rOzJqKqQxQxQxQxQxQxQxO'),  -- password: 123456
('Luis', 'Rodríguez', 'luis.rodriguez@email.com', '$2b$10$rOzJqKqQxQxQxQxQxQxQxO');  -- password: 123456

-- =====================================================
-- INSERTAR INGRESOS DE PRUEBA
-- =====================================================

-- Ingresos para Juan Pérez (idUsuario: 1)
INSERT INTO INGRESO (idUsuario, monto, descripcion, fecha, idTipo) VALUES 
(1, 3500.00, 'Salario mensual enero', '2024-01-31', 1),
(1, 800.00, 'Proyecto freelance web', '2024-01-15', 2),
(1, 150.00, 'Dividendos acciones', '2024-01-10', 6),
(1, 3500.00, 'Salario mensual febrero', '2024-02-29', 1),
(1, 1200.00, 'Bonificación por desempeño', '2024-02-15', 4);

-- Ingresos para María García (idUsuario: 2)
INSERT INTO INGRESO (idUsuario, monto, descripcion, fecha, idTipo) VALUES 
(2, 2800.00, 'Salario mensual enero', '2024-01-31', 1),
(2, 500.00, 'Consultoría marketing', '2024-01-20', 2),
(2, 2800.00, 'Salario mensual febrero', '2024-02-29', 1),
(2, 300.00, 'Venta de productos', '2024-02-10', 5);

-- Ingresos para Carlos López (idUsuario: 3)
INSERT INTO INGRESO (idUsuario, monto, descripcion, fecha, idTipo) VALUES 
(3, 4200.00, 'Salario mensual enero', '2024-01-31', 1),
(3, 600.00, 'Inversión en criptomonedas', '2024-01-25', 3),
(3, 4200.00, 'Salario mensual febrero', '2024-02-29', 1);

-- =====================================================
-- INSERTAR GASTOS DE PRUEBA
-- =====================================================

-- Gastos para Juan Pérez (idUsuario: 1)
INSERT INTO GASTO (idUsuario, monto, descripcion, fecha, fechaRecordatorio, idMetodoPago, idTipo, telefonoPago) VALUES 
(1, 450.00, 'Supermercado semanal', '2024-01-05', NULL, 18, 7, NULL),
(1, 80.00, 'Combustible auto', '2024-01-06', NULL, 19, 8, NULL),
(1, 120.00, 'Cena restaurante', '2024-01-08', NULL, 18, 9, NULL),
(1, 200.00, 'Recibo de luz', '2024-01-10', '2024-02-10', 20, 10, '987654321'),
(1, 150.00, 'Consulta médica', '2024-01-12', NULL, 17, 11, NULL),
(1, 500.00, 'Supermercado mensual', '2024-02-01', NULL, 19, 7, NULL),
(1, 90.00, 'Combustible auto', '2024-02-03', NULL, 18, 8, NULL),
(1, 1200.00, 'Laptop nueva', '2024-02-05', NULL, 18, 15, NULL);

-- Gastos para María García (idUsuario: 2)
INSERT INTO GASTO (idUsuario, monto, descripcion, fecha, fechaRecordatorio, idMetodoPago, idTipo, telefonoPago) VALUES 
(2, 350.00, 'Compras supermercado', '2024-01-03', NULL, 19, 7, NULL),
(2, 60.00, 'Transporte público', '2024-01-05', NULL, 17, 8, NULL),
(2, 180.00, 'Recibo de agua', '2024-01-08', '2024-02-08', 20, 10, '987654322'),
(2, 250.00, 'Ropa nueva', '2024-01-15', NULL, 18, 13, NULL),
(2, 400.00, 'Supermercado febrero', '2024-02-02', NULL, 19, 7, NULL),
(2, 100.00, 'Cine y entretenimiento', '2024-02-10', NULL, 17, 9, NULL);

-- Gastos para Carlos López (idUsuario: 3)
INSERT INTO GASTO (idUsuario, monto, descripcion, fecha, fechaRecordatorio, idMetodoPago, idTipo, telefonoPago) VALUES 
(3, 600.00, 'Supermercado familiar', '2024-01-04', NULL, 18, 7, NULL),
(3, 150.00, 'Combustible camioneta', '2024-01-07', NULL, 19, 8, NULL),
(3, 300.00, 'Recibo de gas', '2024-01-12', '2024-02-12', 20, 10, '987654323'),
(3, 800.00, 'Curso de programación', '2024-01-20', NULL, 18, 12, NULL),
(3, 2000.00, 'Viaje familiar', '2024-02-14', NULL, 18, 16, NULL);

-- Gastos para Ana Martínez (idUsuario: 4)
INSERT INTO GASTO (idUsuario, monto, descripcion, fecha, fechaRecordatorio, idMetodoPago, idTipo, telefonoPago) VALUES 
(4, 280.00, 'Compras semanales', '2024-01-06', NULL, 22, 7, '999888777'),
(4, 45.00, 'Taxi al trabajo', '2024-01-08', NULL, 23, 8, '999888777'),
(4, 120.00, 'Internet mensual', '2024-01-15', '2024-02-15', 20, 10, '987654324');

-- =====================================================
-- CONSULTAS DE VERIFICACIÓN
-- =====================================================

-- Verificar usuarios creados
-- SELECT * FROM USUARIO;

-- Verificar tipos por categoría
-- SELECT * FROM TIPO WHERE categoria = 'Ingreso';
-- SELECT * FROM TIPO WHERE categoria = 'Gasto';
-- SELECT * FROM TIPO WHERE categoria = 'MetodoPago';

-- Verificar balance de usuarios
-- CALL sp_balance_usuario(1);
-- CALL sp_balance_usuario(2);
-- CALL sp_balance_usuario(3);

-- Verificar ingresos por usuario
-- CALL sp_listar_ingresos_usuario(1);

-- Verificar gastos por usuario
-- CALL sp_listar_gastos_usuario(1);

-- Verificar gastos por teléfono
-- CALL sp_listar_gastos_por_telefono('999888777');

-- =====================================================
-- NOTAS IMPORTANTES
-- =====================================================
-- 1. Las contraseñas están hasheadas con bcrypt (todas son '123456')
-- 2. Los IDs de tipos pueden variar según el orden de inserción
-- 3. Ajustar las fechas según necesidades de prueba
-- 4. Los números de teléfono son ficticios para pruebas
-- 5. Ejecutar este script después de crear las tablas y procedures