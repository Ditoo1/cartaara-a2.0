import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)

export default async function handler(req, res) {
  try {
    const { data, error } = await supabase
      .from('menu')
      .select('*')
      .order('section_order', { ascending: true })
      .order('subsection_order', { ascending: true })

    if (error) throw error

    // Transformar datos a la estructura que espera tu frontend
    const menuData = {
      menu: {
        secciones: {}
      }
    }

    data.forEach(item => {
      if (!menuData.menu.secciones[item.section_name]) {
        menuData.menu.secciones[item.section_name] = {
          productos: [],
          subsecciones: {}
        }
      }

      if (item.subsection_name) {
        if (!menuData.menu.secciones[item.section_name].subsecciones[item.subsection_name]) {
          menuData.menu.secciones[item.section_name].subsecciones[item.subsection_name] = {
            nombre: item.subsection_name,
            productos: []
          }
        }
        menuData.menu.secciones[item.section_name].subsecciones[item.subsection_name].productos.push({
          nombre: item.product_name,
          descripcion: item.product_description,
          precio: item.product_price
        })
      } else {
        menuData.menu.secciones[item.section_name].productos.push({
          nombre: item.product_name,
          descripcion: item.product_description,
          precio: item.product_price
        })
      }
    })

    res.status(200).json(menuData)
  } catch (error) {
    console.error('Error fetching menu:', error)
    res.status(500).json({ error: 'Error loading menu' })
  }
}