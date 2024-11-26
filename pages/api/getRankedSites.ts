import { NextApiRequest, NextApiResponse } from 'next';
import { Pool } from 'pg';

// Configuração da pool de conexões com o banco de dados (Neon)
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432', 10),
  ssl: {
    rejectUnauthorized: false,
  },
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const page = parseInt(req.query.page as string) || 1;

    const siteIdBody = req.body.siteId ? Number(req.body.siteId) : undefined;
    
    // Adiciona cabeçalhos para evitar cache
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');
  
    if (req.method === 'GET') {
        const limit = parseInt(req.query.limit as string) || 10;
        const offset = (page - 1) * limit;

        const query = `
            SELECT 
                rs.*
            FROM 
                payments p
            JOIN 
                ranked_sites rs
            ON 
                (p.webhook_event::jsonb #>> '{data,object,metadata,siteId}')::integer = rs.id
            WHERE 
                p.webhook_event::jsonb #>> '{data,object,status}' = $1
            ORDER BY 
                rs.created_at DESC
            LIMIT $2 OFFSET $3;
        `;
    
        const status = 'paid';
  
        try {
            const client = await pool.connect();
            const result = await client.query(query, [status, limit, offset]);

            const resultCount = await client.query(`
                SELECT 
                    COUNT(*)
                FROM 
                    payments p
                JOIN 
                    ranked_sites rs
                ON 
                    (p.webhook_event::jsonb #>> '{data,object,metadata,siteId}')::integer = rs.id
                WHERE 
                    p.webhook_event::jsonb #>> '{data,object,status}' = $1;
            `, [status]);

            const totalSites = parseInt(resultCount.rows[0].count, 10);
            const totalPages = Math.ceil(totalSites / limit);

            client.release();
    
            if (result.rows.length > 0) {
                res.status(200).json({ rankedSites: result.rows, totalPages: totalPages, currentPage: page });
            } else {
                res.status(404).json({ message: 'No ranked sites found for paid events' });
            }
        } catch (error) {
            console.error('Error querying the database:', error);
            res.status(500).json({ error: 'Internal server error' });
        }

    } else if (req.method === 'POST') {

        if (!siteIdBody) {
            return res.status(400).json({ message: 'Site ID is required' });
        }

        try {
            const client = await pool.connect();

            const query = `
                UPDATE ranked_sites
                SET first_visitor_paid = TRUE
                WHERE id = $1 AND first_visitor_paid = FALSE
                RETURNING *;
            `;

            const result = await client.query(query, [siteIdBody]);
    
            if (result.rowCount && result.rowCount > 0) {
                console.log('First visitor rewarded');
                res.status(200).json({ message: 'First visitor rewarded', site: result.rows[0] });
            } else {
                console.log('This visitor has already been rewarded or the site is not eligible.');
                res.status(400).json({ message: 'This visitor has already been rewarded or the site is not eligible.' });
            }

            client.release();
        } catch (error) {
            console.error('Error updating the site:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}
