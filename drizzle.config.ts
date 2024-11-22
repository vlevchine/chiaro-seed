import { defineConfig } from 'drizzle-kit';

const id = 'northern';

export default defineConfig({
  dialect: "sqlite",
  schema: `./src/schema/${id}.ts`,
  out: `./db/${id}/migrations`,
  dbCredentials: {
    //@ts-ignore
    url: `./db/${id}.db`,
  },
  verbose: false,
  strict: true,
});