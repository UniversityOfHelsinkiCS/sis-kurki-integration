# sis-kurki-integration

## Development setup

1. Create a `.env` file in the root directory with contents of the `.env.template` file. Here is a suitable configuration for development purposes:

```
KURKI_DB_USER=system
KURKI_DB_PASSWORD=oracle
KURKI_DB_CONNECTION_STRING=kurki-db:1521/xe
KURKI_FALLBACK_KURSSI_OMISTAJA=DOE_J
SIS_IMPORTER_API_TOKEN=<SIS_IMPORTER_API_TOKEN>
SIS_IMPORTER_API_URL=https://importer.cs.helsinki.fi
```

You will need to request the value of the `SIS_IMPORTER_API_TOKEN` from Toska to be able to finish the development setup.

2. Build the docker image by running `docker-compose up --build`.

3. Once database is running (indicated by the log message `Database ready to use. Enjoy! ;)` in the `kurki-db` container), connect to the `sis-kurki-integration` container:

```
docker exec -it sis-kurki-integration /bin/bash
```

Once connected to the container, run the `npm run migrate:latest` script followed by the `npm run seed:run` script.

---

If you face the following error with the database connection:

```
TNS:listener: all appropriate instances are in restricted mode
```

Use [sqlplus](https://zwbetz.com/install-sqlplus-on-a-mac/) to connect to the database:

```
sqlplus sys/oracle@localhost:1521/xe as sysdba
```

And run the following command:

```sql
ALTER SYSTEM DISABLE RESTRICTED SESSION;
```

When you want to install new npm packages, since project has to have packages installed inside the container use
`npm run install axios` or if you need to reinstall package.json use `npm run build`.

Alternatively you can use `npm run dco:kurki` to connect to the kurki network and not start a database. In this case use the database in kurki config.

## Running tests

1. Build the docker image by running `docker-compose up --build`.

2. Connect to the `sis-kurki-integration` container:

```
docker exec -it sis-kurki-integration /bin/bash
```

3. Once connected to the container, run the `npm test` script.

## Connecting to the production database

1. Set correct database configuration in the `.env` file.
2. When running, start the tunnel with `npm run tunnel`.

## Todo

- Add `SIS_ID` column for `Kurssi` table in Kurki:

```sql
ALTER TABLE Kurssi ADD SIS_ID VARCHAR2(50) UNIQUE;
```

- Add `SIS_ID` column for `Opetus` table in Kurki:

```sql
ALTER TABLE Opetus ADD SIS_ID VARCHAR2(50) UNIQUE;
```

- Add `SIS_ID` column for `Henkilo` table in Kurki:

```sql
ALTER TABLE Henkilo ADD SIS_ID VARCHAR2(50) UNIQUE;
```
