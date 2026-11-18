# LogiRed · Jornada diurno · Grupo 2

Aplicación web de LogiRed S.A.S., empresa de logística y mensajería, para gestionar clientes, envíos, conductores y vehículos mediante microservicios (Node.js + Express). Proyecto del Módulo 3 de Redes y Servicios Multimedia, Universidad Autónoma de Occidente.

## Integrantes

|Integrante|Usuario de GitHub|Microservicio a cargo|
|-|-|-|
|Alejandro Arias Ramirez|xAlejo17|ms-clientes|
|Mariana Parra Acosta|Mar0921|ms-envios|
|Juan Felipe Fernandez Losada|JuanfeFernandez|ms-conductores|
|Santiago Peña Agudelo|Stiago521|ms-vehiculos|

## Microservicios

|Carpeta|Entidad|Responsable|Puerto|Depende de|
|-|-|-|-|-|
|`ms-usuarios`|Usuario|Docente|3001|—|
|`ms-clientes`|Cliente|Alejandro Arias|3002|— (es consultado por `ms-envios`)|
|`ms-envios`|Envío|Mariana Parra|3003|`ms-clientes` (guarda `cliente_id`)|
|`ms-conductores`|Conductor|Juan Felipe Fernandez|3004|— (es consultado por `ms-vehiculos`)|
|`ms-vehiculos`|Vehículo|Santiago Peña|3005|`ms-conductores` (guarda `conductor_id`)|

Cada microservicio es dueño exclusivo de sus datos. Las relaciones entre microservicios se guardan como un id y se consultan por REST. No hay claves foráneas entre bases de datos distintas.

El contrato de cada API está en el README de su propia carpeta, junto con la colección de Postman en `docs/`.

## Estructura del repositorio

```
logired-diurno-g2/
├── README.md          ← este archivo
├── ms-usuarios/       ← entregado por la docente (nadie lo modifica)
├── ms-clientes/       ← microservicio de clientes
├── ms-envios/         ← microservicio de envíos
├── ms-conductores/    ← microservicio de conductores
├── ms-vehiculos/      ← microservicio de vehículos
├── frontend/          ← interfaz web (HTML, CSS y JavaScript)
└── deploy/            ← archivos de despliegue (Taller 3)
```

Dentro de cada microservicio el código está en capas: `src/routes` → `src/controllers` → `src/services` → `src/repositories`, más `src/models`. Cada uno trae además su `db/schema.sql`, su `.env.example` y su colección de Postman en `docs/`.

La carpeta `deploy/` contiene las unidades de systemd de los cinco microservicios y el host virtual del gateway de Apache.

## Cómo ejecutar un microservicio en el PC

Para desarrollo, con MySQL local (XAMPP o similar). Requisitos: Node.js 22 o superior.

```
cd ms-envios
npm install
copy .env.example .env      # en Linux o Mac: cp .env.example .env
npm run dev
```

Edita el `.env` con los datos de tu MySQL local antes de arrancar. El servicio queda en `http://localhost:<puerto>`, por ejemplo `http://localhost:3003/health`.

El archivo `.env` y la carpeta `node_modules` no se suben al repositorio.

---

# Despliegue en el ambiente del Módulo 2

La aplicación se despliega sobre las dos máquinas virtuales del Módulo 2. Sustituye las direcciones por las de tu ambiente.

|Componente|Equipo|Dirección|Puerto|Accesible desde|
|-|-|-|-|-|
|bind9 (DNS)|servidor1|172.16.0.130|53|Red interna|
|MySQL|servidor1|172.16.0.130|3306|Solo servidor2|
|Apache (gateway y frontend)|servidor2|172.16.0.131|80|Windows y red interna|
|ms-usuarios|servidor2|127.0.0.1|3001|Solo servidor2|
|ms-clientes|servidor2|127.0.0.1|3002|Solo servidor2|
|ms-envios|servidor2|127.0.0.1|3003|Solo servidor2|
|ms-conductores|servidor2|127.0.0.1|3004|Solo servidor2|
|ms-vehiculos|servidor2|127.0.0.1|3005|Solo servidor2|

Los microservicios escuchan únicamente en `127.0.0.1`. Sus puertos no se abren en el cortafuegos: la única entrada desde fuera es el gateway en el puerto 80.

> **Las contraseñas no están en este repositorio.** Donde aparezca `<clave ...>`, usa la que acordó el grupo por el canal privado. El repositorio es público.

## Paso 1. MySQL en servidor1

```
sudo apt update && sudo apt install -y mysql-server
```

En `/etc/mysql/mysql.conf.d/mysqld.cnf`, haz que escuche también en la dirección interna del servidor:

```
bind-address = 127.0.0.1,172.16.0.130
```

Sin espacio después de la coma. Luego reinicia y abre el puerto solo para servidor2:

```
sudo systemctl restart mysql
sudo ufw allow from 172.16.0.131 to any port 3306 proto tcp
sudo ss -tlnp | grep 3306
```

El `ss` debe mostrar dos líneas: una en `127.0.0.1:3306` y otra en `172.16.0.130:3306`.

## Paso 2. Bases de datos y usuarios, en servidor1

Un usuario por microservicio, cada uno restringido a conexiones desde servidor2.

```
sudo mysql
```

```sql
CREATE DATABASE usuarios_db;
CREATE USER 'usuarios_user'@'172.16.0.131' IDENTIFIED BY '<clave de usuarios_user>';
GRANT ALL PRIVILEGES ON usuarios_db.* TO 'usuarios_user'@'172.16.0.131';

CREATE DATABASE clientes_db;
CREATE USER 'clientes_user'@'172.16.0.131' IDENTIFIED BY '<clave de clientes_user>';
GRANT ALL PRIVILEGES ON clientes_db.* TO 'clientes_user'@'172.16.0.131';

CREATE DATABASE envios_db;
CREATE USER 'envios_user'@'172.16.0.131' IDENTIFIED BY '<clave de envios_user>';
GRANT ALL PRIVILEGES ON envios_db.* TO 'envios_user'@'172.16.0.131';

CREATE DATABASE conductores_db;
CREATE USER 'conductores_user'@'172.16.0.131' IDENTIFIED BY '<clave de conductores_user>';
GRANT ALL PRIVILEGES ON conductores_db.* TO 'conductores_user'@'172.16.0.131';

CREATE DATABASE vehiculos_db;
CREATE USER 'vehiculos_user'@'172.16.0.131' IDENTIFIED BY '<clave de vehiculos_user>';
GRANT ALL PRIVILEGES ON vehiculos_db.* TO 'vehiculos_user'@'172.16.0.131';

FLUSH PRIVILEGES;
exit
```

Usa contraseñas de solo letras y números. Un símbolo puede escribirse distinto según el teclado de cada servidor y produce un error de acceso difícil de encontrar.

Comprueba que las cinco cuentas quedaron con el origen correcto:

```sql
SELECT user, host FROM mysql.user WHERE user LIKE '%_user';
```

## Paso 3. Node.js, código y usuario del servicio, en servidor2

El paquete `nodejs` de Ubuntu 22.04 es demasiado antiguo para Express 5.

```
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs git mysql-client
node -v
```

Debe decir v22 o superior. Crea el usuario del sistema con el que correrán los servicios, sin privilegios y sin carpeta personal:

```
sudo adduser --system --group --no-create-home nodeapps
```

Y trae el código:

```
sudo mkdir -p /srv/logired/app && sudo chown vagrant:vagrant /srv/logired/app
cd /srv/logired/app
git clone https://github.com/Mar0921/logired-diurno-g2.git .
```

## Paso 4. Preparar cada microservicio, en servidor2

Lo siguiente se repite para los cinco. El ejemplo usa `ms-clientes`.

```
cd /srv/logired/app/ms-clientes
npm ci --omit=dev
cp .env.example .env
nano .env
```

En el `.env` cambian tres cosas respecto al de desarrollo: `DB_HOST` apunta a servidor1, la contraseña es la de producción, y `JWT_SECRET` es la misma frase en los cinco microservicios.

```
PORT=3002
HOST=127.0.0.1
DB_HOST=172.16.0.130
DB_PORT=3306
DB_NAME=clientes_db
DB_USER=clientes_user
DB_PASSWORD=<clave de clientes_user>
JWT_SECRET=<clave JWT del grupo>
```

`ms-envios` lleva además `CLIENTES_URL=http://127.0.0.1:3002`, y `ms-vehiculos` lleva `CONDUCTORES_URL=http://127.0.0.1:3004`. Los microservicios se hablan por la dirección local porque viven en el mismo equipo.

Protege el archivo, que contiene las credenciales:

```
chmod 640 .env && sudo chgrp nodeapps .env
```

Y crea la tabla en servidor1, desde aquí:

```
mysql -h 172.16.0.130 -u clientes_user -p clientes_db < db/schema.sql
mysql -h 172.16.0.130 -u clientes_user -p clientes_db -e "SELECT * FROM clientes"
```

## Paso 5. Registrar los microservicios como servicios del sistema

Las cinco unidades están en `deploy/`. Cópialas y actívalas:

```
sudo cp /srv/logired/app/deploy/ms-*.service /etc/systemd/system/
sudo systemctl daemon-reload
```

Arranca **ms-usuarios de primero**, porque sin él nadie obtiene un token:

```
sudo systemctl enable --now ms-usuarios
systemctl status ms-usuarios
```

Y luego los demás:

```
sudo systemctl enable --now ms-clientes
sudo systemctl enable --now ms-envios
sudo systemctl enable --now ms-conductores
sudo systemctl enable --now ms-vehiculos
```

Comprueba que los cinco responden y que escuchan solo en la dirección local:

```
for p in 3001 3002 3003 3004 3005; do curl -s http://127.0.0.1:$p/health; echo; done
sudo ss -tlnp | grep 300
```

**No abras los puertos 3001 a 3005 en ufw.** En servidor2 solo deben estar abiertos el 22 y el 80.

## Paso 6. Registro DNS, en servidor1

En la zona directa, agrega el registro y sube el serial:

```
app     IN      A       172.16.0.131
```

```
sudo named-checkzone logired.com /etc/bind/db.logired.com
sudo systemctl restart bind9
```

Desde Windows, `nslookup app.logired.com` debe devolver la dirección de servidor2.

## Paso 7. Gateway de Apache, en servidor2

```
sudo a2enmod proxy proxy_http
sudo mkdir -p /var/www/app
sudo cp /srv/logired/app/deploy/app.conf /etc/apache2/sites-available/
sudo a2ensite app.conf
sudo apache2ctl configtest
sudo systemctl restart apache2
```

El `configtest` debe decir `Syntax OK`. El host virtual sirve el frontend desde `/var/www/app` y reenvía cada ruta `/api/<recurso>` al microservicio que corresponde.

## Paso 8. Publicar el frontend, en servidor2

```
sudo cp -r /srv/logired/app/frontend/* /var/www/app/
```

Con esto la aplicación abre en `http://app.logired.com`.

## Paso 9. Cuentas de la aplicación

El `schema.sql` de `ms-usuarios` crea el administrador inicial con una contraseña que conoce todo el curso. **Cámbiala apenas el gateway funcione**, con un `PUT /api/usuarios/1` enviando el JSON completo más el campo `password`.

Después crea un usuario por cada rol de la empresa. Los roles son `administrador`, `despacho` y `flota`.

|Cuenta|Rol|
|-|-|
|admin@empresa.com|administrador|
|despacho@logired.com|despacho|
|flota@logired.com|flota|

Las contraseñas se comparten por el canal privado del grupo.

## Comprobación final

|#|Prueba|Resultado esperado|
|-|-|-|
|1|`nslookup app.logired.com` desde Windows|Dirección de servidor2|
|2|Abrir `http://app.logired.com` y entrar con un usuario de cada rol|Cada uno llega a la página de su rol|
|3|`GET /api/clientes` sin token, en Postman|401|
|4|`POST /api/clientes` con el token de un rol sin permiso|403|
|5|Las colecciones de Postman con base `http://app.logired.com/api`|Los mismos códigos del Taller 2|
|6|`curl.exe http://172.16.0.131:3002/health` y `Test-NetConnection 172.16.0.130 -Port 3306` desde Windows|Ambos fallan|
|7|Listar Envíos con `journalctl -u ms-clientes -f` abierto|El cliente aparece en pantalla y en el registro sale una sola consulta `?ids=`|
|8|Detener ms-clientes y repetir la prueba 7, luego crear un envío|La lista sigue respondiendo con un aviso; al crear, mensaje del 503|
|9|`sudo reboot` en servidor2 y volver a abrir la aplicación|Los cinco servicios vuelven solos|

## Actualizar la aplicación después de un cambio

En servidor2:

```
cd /srv/logired/app
git pull
```

Si cambió un microservicio:

```
cd ms-clientes
npm ci --omit=dev
sudo systemctl restart ms-clientes
```

Si cambió el frontend:

```
sudo cp -r /srv/logired/app/frontend/* /var/www/app/
```

Si cambió el `app.conf`:

```
sudo cp /srv/logired/app/deploy/app.conf /etc/apache2/sites-available/
sudo apache2ctl configtest
sudo systemctl restart apache2
```

## Diagnóstico

|Síntoma|Dónde mirar|
|-|-|
|Un servicio no arranca|`journalctl -u ms-<recurso> -n 30`|
|`Access denied` al conectar a MySQL|Contraseña del `.env`, y que el usuario exista con origen `172.16.0.131`|
|401 con un token válido|Que `JWT_SECRET` sea idéntico en los cinco `.env`|
|503 desde el gateway|El microservicio de destino está detenido: `systemctl status ms-<recurso>`|
|404 desde el gateway|La pareja `ProxyPass` del `app.conf` no corresponde con la ruta interna|
|`Could not resolve host` dentro de una VM|`resolvectl dns <interfaz> 172.16.0.130` y `resolvectl domain <interfaz> logired.com`|
