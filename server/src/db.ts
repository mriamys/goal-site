import knex from 'knex';
import path from 'path';

const db = knex({
  client: 'sqlite3',
  connection: {
    filename: path.join(__dirname, '../data.sqlite'),
  },
  useNullAsDefault: true,
});

export async function initDb() {
  const hasGoalsTable = await db.schema.hasTable('goals');
  if (!hasGoalsTable) {
    await db.schema.createTable('goals', (table) => {
      table.increments('id').primary();
      table.string('title').notNullable();
      table.string('image_url');
      table.decimal('target_amount', 10, 2).notNullable();
      table.decimal('current_amount', 10, 2).defaultTo(0);
      table.string('currency').defaultTo('UAH');
      table.timestamps(true, true);
    });
  }

  const hasTransactionsTable = await db.schema.hasTable('transactions');
  if (!hasTransactionsTable) {
    await db.schema.createTable('transactions', (table) => {
      table.increments('id').primary();
      table.integer('goal_id').references('id').inTable('goals').onDelete('CASCADE');
      table.decimal('amount', 10, 2).notNullable();
      table.string('description');
      table.string('date');
      table.timestamps(true, true);
    });
  } else {
    const hasDateColumn = await db.schema.hasColumn('transactions', 'date');
    if (!hasDateColumn) {
      await db.schema.alterTable('transactions', (table) => {
        table.string('date');
      });
    }
  }
}

export default db;