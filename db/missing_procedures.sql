-- Stored procedures faltantes para la API
-- Estos procedimientos usan los nombres que espera el código de la aplicación

DELIMITER //

-- Procedimiento para calcular balance (usado en balanceController.js)
CREATE PROCEDURE CalcularBalance (
  IN p_idUsuario INT
)
BEGIN
  SELECT 
    (SELECT IFNULL(SUM(monto), 0) FROM INGRESO WHERE idUsuario = p_idUsuario) -
    (SELECT IFNULL(SUM(monto), 0) FROM GASTO WHERE idUsuario = p_idUsuario) AS balance;
END;
//

-- Procedimiento para listar ingresos por usuario (usado en ingresoController.js)
CREATE PROCEDURE ListarIngresosPorUsuario (
  IN p_idUsuario INT
)
BEGIN
  SELECT i.idIngreso, i.monto, i.descripcion, i.fecha, t.nombreTipo
  FROM INGRESO i
  JOIN TIPO t ON i.idTipo = t.idTipo
  WHERE i.idUsuario = p_idUsuario
    AND t.categoria = 'Ingreso'
  ORDER BY i.fecha DESC;
END;
//

-- Procedimiento para listar gastos por usuario (usado en gastoController.js)
CREATE PROCEDURE ListarGastosPorUsuario (
  IN p_idUsuario INT
)
BEGIN
  SELECT g.idGasto, g.monto, g.descripcion, g.fecha, g.fechaRecordatorio,
         g.telefonoPago, mp.nombreTipo AS metodoPago, tg.nombreTipo AS tipoGasto
  FROM GASTO g
  LEFT JOIN TIPO mp ON g.idMetodoPago = mp.idTipo AND mp.categoria = 'MetodoPago'
  JOIN TIPO tg ON g.idTipo = tg.idTipo AND tg.categoria = 'Gasto'
  WHERE g.idUsuario = p_idUsuario
  ORDER BY g.fecha DESC;
END;
//

-- Procedimiento para listar gastos por teléfono (usado en gastoController.js)
CREATE PROCEDURE ListarGastosPorTelefono (
  IN p_telefonoPago VARCHAR(15)
)
BEGIN
  SELECT g.idGasto, g.monto, g.descripcion, g.fecha, g.fechaRecordatorio,
         g.telefonoPago, mp.nombreTipo AS metodoPago, tg.nombreTipo AS tipoGasto
  FROM GASTO g
  LEFT JOIN TIPO mp ON g.idMetodoPago = mp.idTipo AND mp.categoria = 'MetodoPago'
  JOIN TIPO tg ON g.idTipo = tg.idTipo AND tg.categoria = 'Gasto'
  WHERE g.telefonoPago = p_telefonoPago
  ORDER BY g.fecha DESC;
END;
//

-- Procedimiento para insertar ingreso (usado en ingresoController.js)
CREATE PROCEDURE InsertarIngreso (
  IN p_idUsuario INT,
  IN p_monto DECIMAL(10,2),
  IN p_descripcion VARCHAR(255),
  IN p_fecha DATE,
  IN p_idTipo INT
)
BEGIN
  INSERT INTO INGRESO (idUsuario, monto, descripcion, fecha, idTipo)
  VALUES (p_idUsuario, p_monto, p_descripcion, p_fecha, p_idTipo);
  
  SELECT LAST_INSERT_ID() as idIngreso;
END;
//

-- Procedimiento para insertar gasto (usado en gastoController.js)
CREATE PROCEDURE InsertarGasto (
  IN p_idUsuario INT,
  IN p_monto DECIMAL(10,2),
  IN p_descripcion VARCHAR(255),
  IN p_fecha DATE,
  IN p_fechaRecordatorio DATE,
  IN p_idMetodoPago INT,
  IN p_idTipo INT,
  IN p_telefonoPago VARCHAR(15)
)
BEGIN
  INSERT INTO GASTO (
    idUsuario, monto, descripcion, fecha, fechaRecordatorio, idMetodoPago, idTipo, telefonoPago
  )
  VALUES (
    p_idUsuario, p_monto, p_descripcion, p_fecha, p_fechaRecordatorio, p_idMetodoPago, p_idTipo, p_telefonoPago
  );
  
  SELECT LAST_INSERT_ID() as idGasto;
END;
//

-- Procedimiento para eliminar ingreso (usado en ingresoController.js)
CREATE PROCEDURE EliminarIngreso (
  IN p_idIngreso INT,
  IN p_idUsuario INT
)
BEGIN
  DELETE FROM INGRESO
  WHERE idIngreso = p_idIngreso AND idUsuario = p_idUsuario;
  
  SELECT ROW_COUNT() as filasAfectadas;
END;
//

-- Procedimiento para eliminar gasto (usado en gastoController.js)
CREATE PROCEDURE EliminarGasto (
  IN p_idGasto INT,
  IN p_idUsuario INT
)
BEGIN
  DELETE FROM GASTO
  WHERE idGasto = p_idGasto AND idUsuario = p_idUsuario;
  
  SELECT ROW_COUNT() as filasAfectadas;
END;
//

DELIMITER ;