# sis-kurki-integration

## Development setup

1. Create a `.env` file in the root directory with contents of the `.env.template` file. Here is a suitable configuration for development purposes:

```
KURKI_DB_USER=system
KURKI_DB_PASSWORD=oracle
KURKI_DB_CONNECTION_STRING=kurki-db:1521/xe
KURKI_FALLBACK_KURSSI_OMISTAJA=DOE_J
SIS_API_TOKEN=<SIS_API_TOKEN>
SIS_API_URL=https://oodikone-staging.cs.helsinki.fi/importer
```

You will need to request the value of the `SIS_API_TOKEN` from Toska to be able to finish the development setup.

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

- Add `sisId` for `Kurssi` table in Kurki.
