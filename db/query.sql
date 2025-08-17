CREATE TABLE USUARIO (
  idUsuario INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
  nombreUsuario VARCHAR(30) NOT NULL,
  apellidoUsuario VARCHAR(30) NOT NULL,
  correoUsuario VARCHAR(200) NOT NULL UNIQUE,
  passwordUsuario VARCHAR(100) NOT NULL
);

CREATE TABLE TIPO (
  idTipo INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
  nombreTipo VARCHAR(50) NOT NULL,
  categoria ENUM('Ingreso', 'Gasto', 'MetodoPago') NOT NULL
);

CREATE TABLE INGRESO (
  idIngreso INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
  idUsuario INT NOT NULL,
  monto DECIMAL(10,2) NOT NULL,
  descripcion VARCHAR(255),
  fecha DATE NOT NULL,
  idTipo INT NOT NULL,
  FOREIGN KEY (idUsuario) REFERENCES USUARIO(idUsuario) ON DELETE CASCADE,
  FOREIGN KEY (idTipo) REFERENCES TIPO(idTipo)
);

CREATE TABLE GASTO (
  idGasto INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
  idUsuario INT NOT NULL,
  monto DECIMAL(10,2) NOT NULL,
  descripcion VARCHAR(255),
  fecha DATE NOT NULL,
  fechaRecordatorio DATE,
  idMetodoPago INT,
  idTipo INT NOT NULL,
  telefonoPago VARCHAR(15) NULL,
  FOREIGN KEY (idUsuario) REFERENCES USUARIO(idUsuario) ON DELETE CASCADE,
  FOREIGN KEY (idMetodoPago) REFERENCES TIPO(idTipo),
  FOREIGN KEY (idTipo) REFERENCES TIPO(idTipo)
);

DELIMITER //

CREATE PROCEDURE sp_insertar_ingreso (
  IN p_idUsuario INT,
  IN p_monto DECIMAL(10,2),
  IN p_descripcion VARCHAR(255),
  IN p_fecha DATE,
  IN p_idTipo INT
)
BEGIN
  INSERT INTO INGRESO (idUsuario, monto, descripcion, fecha, idTipo)
  VALUES (p_idUsuario, p_monto, p_descripcion, p_fecha, p_idTipo);
END;
//

CREATE PROCEDURE sp_eliminar_ingreso (
  IN p_idIngreso INT,
  IN p_idUsuario INT
)
BEGIN
  DELETE FROM INGRESO
  WHERE idIngreso = p_idIngreso AND idUsuario = p_idUsuario;
END;
//

CREATE PROCEDURE sp_insertar_gasto (
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
END;
//

CREATE PROCEDURE sp_eliminar_gasto (
  IN p_idGasto INT,
  IN p_idUsuario INT
)
BEGIN
  DELETE FROM GASTO
  WHERE idGasto = p_idGasto AND idUsuario = p_idUsuario;
END;
//

CREATE PROCEDURE sp_balance_usuario (
  IN p_idUsuario INT
)
BEGIN
  SELECT 
    (SELECT IFNULL(SUM(monto), 0) FROM INGRESO WHERE idUsuario = p_idUsuario) -
    (SELECT IFNULL(SUM(monto), 0) FROM GASTO WHERE idUsuario = p_idUsuario) AS balance;
END;
//

CREATE PROCEDURE sp_listar_ingresos_usuario (
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

CREATE PROCEDURE sp_listar_gastos_usuario (
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

CREATE PROCEDURE sp_listar_gastos_por_telefono (
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

DELIMITER ;
