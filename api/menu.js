// pages/api/menu.js

import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_KEY;

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  try {
    // Realizamos la consulta para obtener los productos
    const { data, error } = await supabase.from('productos').select('*');

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    // Respondemos con los datos obtenidos
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: 'Error al conectar con Supabase' });
  }
}
