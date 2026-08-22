/* eslint-disable no-console */
const path = require('path');
const argon2 = require('argon2');
const { Client } = require('pg');
const { config: loadEnv } = require('dotenv');

loadEnv({ path: path.join(__dirname, '../../.env') });
loadEnv({ path: path.join(__dirname, '../.env') });

/** El PEM vive en src/database/supabase-ca.ts para que Vercel lo bundlee; acá se
 *  lee de ahí en vez de duplicarlo, que es como se desincronizan las cosas. */
function supabaseRootCa() {
  const src = require('fs').readFileSync(path.join(__dirname, '../src/database/supabase-ca.ts'), 'utf8');
  return src.match(/-----BEGIN CERTIFICATE-----[\s\S]*?-----END CERTIFICATE-----/)[0];
}

const PASSWORD_PLAIN = process.env.SEED_PASSWORD || 'Abcd1234';
const COUNT = Number(process.env.SEED_COUNT) || 90;

const FIRST_NAMES = [
  'Sofía', 'Martina', 'Valentina', 'Camila', 'Lucía', 'Renata', 'Catalina', 'Emilia', 'Florencia', 'Antonella',
  'Julieta', 'Pilar', 'Rocío', 'Paula', 'Agustina', 'Delfina', 'Bianca', 'Mía', 'Isabella', 'Olivia',
  'Mateo', 'Benjamín', 'Joaquín', 'Lautaro', 'Tomás', 'Bautista', 'Santino', 'Bruno', 'Felipe', 'Gael',
  'Thiago', 'Dante', 'Iván', 'Ezequiel', 'Maximiliano', 'Nicolás', 'Cristian', 'Diego', 'Andrés', 'Sebastián',
  'Alejandra', 'Victoria', 'Laura', 'Carolina', 'Daniela',
];

const LAST_NAMES = [
  'García', 'Rodríguez', 'González', 'Fernández', 'López', 'Martínez', 'Pérez', 'Sánchez', 'Romero', 'Torres',
  'Álvarez', 'Ruiz', 'Ramírez', 'Flores', 'Acosta', 'Benítez', 'Medina', 'Suárez', 'Castro', 'Ortiz',
  'Ríos', 'Molina', 'Vega', 'Cabrera', 'Aguirre', 'Silva', 'Navarro', 'Rojas', 'Núñez', 'Domínguez',
];

const CITIES = [
  ['Buenos Aires', 'Argentina'],
  ['Córdoba', 'Argentina'],
  ['Rosario', 'Argentina'],
  ['Mendoza', 'Argentina'],
  ['La Plata', 'Argentina'],
  ['Mar del Plata', 'Argentina'],
  ['Montevideo', 'Uruguay'],
  ['Santiago', 'Chile'],
  ['Lima', 'Perú'],
  ['Bogotá', 'Colombia'],
  ['Ciudad de México', 'México'],
  ['Madrid', 'España'],
  ['Barcelona', 'España'],
];

const GENDERS = ['female', 'male', 'non_binary', 'other', 'unspecified'];
const CONDITIONS = ['new', 'like_new', 'good', 'fair'];
const CATEGORIES = ['top', 'bottom', 'dress', 'outerwear', 'shoes', 'accessory', 'bag', 'other'];

// Pool of garment templates per category. Title, description and image URL are tied together.
// Image URLs use Unsplash photo IDs — well-known fashion-related photos.
const GARMENT_POOLS = {
  top: [
    { title: 'Camisa blanca oversize', brand: 'Zara', color: 'Blanco', size: 'M',
      description: 'Camisa blanca de corte amplio, ideal para combinar con jeans o pantalones sastreros.',
      photoId: '1521572163474-6864f9cf17ab' },
    { title: 'Remera básica negra', brand: 'Uniqlo', color: 'Negro', size: 'S',
      description: 'Remera de algodón pima, súper suave. La usé pocas veces, está como nueva.',
      photoId: '1503341504253-dff4815485f1' },
    { title: 'Sweater de lana beige', brand: 'H&M', color: 'Beige', size: 'L',
      description: 'Sweater tejido, abriga muchísimo. Perfecto para días fríos.',
      photoId: '1583743814966-8936f5b7be1a' },
    { title: 'Blusa de seda floral', brand: 'Mango', color: 'Multicolor', size: 'M',
      description: 'Blusa con estampa floral, caída elegante. Ideal para una salida nocturna.',
      photoId: '1564257631407-4deb1f99d992' },
    { title: 'Camiseta vintage de banda', brand: 'Vintage', color: 'Negro', size: 'M',
      description: 'Remera vintage de banda de rock, conseguida en una feria americana. Algo decolorada.',
      photoId: '1576566588028-4147f3842f27' },
    { title: 'Polo a rayas marino', brand: 'Lacoste', color: 'Azul', size: 'L',
      description: 'Chomba a rayas, clásica. La usé un par de veranos, sigue impecable.',
      photoId: '1586790170083-2f9ceadc732d' },
  ],
  bottom: [
    { title: 'Jean mom fit azul', brand: 'Levi’s', color: 'Azul', size: '28',
      description: 'Jean mom fit con tiro alto, queda buenísimo. Lo compré hace un mes pero me quedó grande.',
      photoId: '1542272604-787c3835535d' },
    { title: 'Pantalón sastre negro', brand: 'Zara', color: 'Negro', size: 'M',
      description: 'Pantalón de vestir de tiro alto, perfecto para la oficina. Material liviano.',
      photoId: '1594633312681-425c7b97ccd1' },
    { title: 'Short de jean clásico', brand: 'Levi’s', color: 'Celeste', size: '26',
      description: 'Short de jean estilo clásico, muy versátil para verano.',
      photoId: '1591195853828-11db59a44f6b' },
    { title: 'Pollera midi plisada', brand: 'H&M', color: 'Beige', size: 'S',
      description: 'Pollera midi plisada, queda increíble con remeras básicas o blusas.',
      photoId: '1577900232427-18219b9166a0' },
    { title: 'Jogger gris melange', brand: 'Adidas', color: 'Gris', size: 'L',
      description: 'Jogger cómodo para entrenar o estar en casa. Algodón con interior afelpado.',
      photoId: '1552902865-b72c031ac5ea' },
    { title: 'Pantalón cargo verde militar', brand: 'Carhartt', color: 'Verde', size: '32',
      description: 'Cargo con bolsillos amplios, súper resistente. Estilo militar moderno.',
      photoId: '1473966968600-fa801b869a1a' },
  ],
  dress: [
    { title: 'Vestido midi floreado', brand: 'Mango', color: 'Rosa', size: 'M',
      description: 'Vestido midi con estampa floral, ideal para una boda o evento al aire libre.',
      photoId: '1496217590455-aa63a8350eea' },
    { title: 'Vestido negro de cóctel', brand: 'Zara', color: 'Negro', size: 'S',
      description: 'Pequeño vestido negro, atemporal. Lo usé una sola vez para una fiesta.',
      photoId: '1539109136881-3be0616acf4b' },
    { title: 'Vestido lencero satinado', brand: 'H&M', color: 'Champagne', size: 'M',
      description: 'Vestido estilo lencero con caída fluida. Ideal para una salida nocturna.',
      photoId: '1572804013309-59a88b7e92f1' },
    { title: 'Vestido de lino playero', brand: 'Massimo Dutti', color: 'Blanco', size: 'L',
      description: 'Vestido largo de lino, fresquísimo para el verano. Puro confort.',
      photoId: '1515372039744-b8f02a3ae446' },
    { title: 'Vestido camisero a cuadros', brand: 'Uniqlo', color: 'Azul', size: 'M',
      description: 'Vestido camisero con cinto, queda lindísimo. Ideal entretiempo.',
      photoId: '1485968579580-b6d095142e6e' },
  ],
  outerwear: [
    { title: 'Campera de jean clara', brand: 'Levi’s', color: 'Celeste', size: 'M',
      description: 'Campera de jean clásica, queda con todo. Algo gastada en los puños, le da onda.',
      photoId: '1551028719-00167b16eac5' },
    { title: 'Tapado largo de paño', brand: 'Mango', color: 'Camel', size: 'M',
      description: 'Tapado largo color camel, abriga muchísimo y queda elegante.',
      photoId: '1539533018447-63fcce2678e3' },
    { title: 'Campera de cuero biker', brand: 'AllSaints', color: 'Negro', size: 'M',
      description: 'Campera de cuero genuino estilo motoquera. La cuidé mucho, está casi sin uso.',
      photoId: '1551028719-738063d5b71e' },
    { title: 'Parka acolchada', brand: 'Uniqlo', color: 'Verde', size: 'L',
      description: 'Parka acolchada con capucha de piel desmontable. Muy abrigada.',
      photoId: '1544022613-e87ca75a784a' },
    { title: 'Trench beige clásico', brand: 'Burberry', color: 'Beige', size: 'M',
      description: 'Trench coat clásico, puro estilo. Doble botonadura y cinto.',
      photoId: '1591047139829-d91aecb6caea' },
  ],
  shoes: [
    { title: 'Zapatillas blancas Stan Smith', brand: 'Adidas', color: 'Blanco', size: '38',
      description: 'Zapatillas blancas clásicas, combinan con todo. Usadas pero en buen estado.',
      photoId: '1542291026-7eec264c27ff' },
    { title: 'Botas negras de cuero', brand: 'Dr. Martens', color: 'Negro', size: '37',
      description: 'Botas Dr. Martens 1460 originales, cuero impecable. Las usé pocas veces.',
      photoId: '1608256246200-53e635b5b65f' },
    { title: 'Zapatillas runner', brand: 'Nike', color: 'Negro', size: '40',
      description: 'Zapatillas para correr, muy cómodas y livianas. Buena amortiguación.',
      photoId: '1542291026-7eec264c27ff' },
    { title: 'Sandalias romanas', brand: 'Zara', color: 'Marrón', size: '36',
      description: 'Sandalias estilo romano de cuero, ideales para verano.',
      photoId: '1603487742131-4160ec999306' },
    { title: 'Borcegos con plataforma', brand: 'Vagabond', color: 'Negro', size: '38',
      description: 'Borcegos con plataforma, suman altura sin perder comodidad.',
      photoId: '1520639888713-7851133b1ed0' },
  ],
  accessory: [
    { title: 'Cinturón de cuero marrón', brand: 'Prüne', color: 'Marrón', size: 'M',
      description: 'Cinturón de cuero genuino, hebilla plateada. Súper versátil.',
      photoId: '1553062407-98eeb64c6a62' },
    { title: 'Pañuelo de seda estampado', brand: 'Hermès (réplica)', color: 'Multicolor', size: 'U',
      description: 'Pañuelo de seda con estampa geométrica, queda hermoso atado al cuello.',
      photoId: '1601924994987-69e26d50dc26' },
    { title: 'Gorro de lana tejido', brand: 'H&M', color: 'Crudo', size: 'U',
      description: 'Gorro de lana tejido a mano, muy abrigado. Bonus: pompón en la punta.',
      photoId: '1576871337622-98d48d1cf531' },
    { title: 'Anteojos de sol cat-eye', brand: 'Ray-Ban', color: 'Carey', size: 'U',
      description: 'Anteojos estilo cat-eye, marco carey. Sin rayones, en su funda original.',
      photoId: '1577803645773-f96470509666' },
    { title: 'Reloj minimalista', brand: 'Daniel Wellington', color: 'Plateado', size: 'U',
      description: 'Reloj con malla mesh plateada, estilo minimalista.',
      photoId: '1524805444758-089113d48a6d' },
  ],
  bag: [
    { title: 'Bolso tote de lona', brand: 'Uniqlo', color: 'Crudo', size: 'L',
      description: 'Tote bag de lona, ideal para diario. Tiene un bolsillo interior.',
      photoId: '1544816155-12df9643f363' },
    { title: 'Mochila urbana negra', brand: 'Herschel', color: 'Negro', size: 'M',
      description: 'Mochila Herschel Little America, compartimento para notebook hasta 15".',
      photoId: '1553062407-98eeb64c6a62' },
    { title: 'Cartera de cuero crossbody', brand: 'Coach', color: 'Camel', size: 'S',
      description: 'Cartera crossbody de cuero, herrajes dorados. Súper lookeada.',
      photoId: '1591561954555-607968c989ab' },
    { title: 'Bandolera tipo baguette', brand: 'Zara', color: 'Marrón', size: 'S',
      description: 'Bandolera estilo baguette, tendencia que volvió fuerte. Casi sin uso.',
      photoId: '1566150905458-1bf1fc113f0d' },
    { title: 'Riñonera de nylon', brand: 'Prada (réplica)', color: 'Negro', size: 'S',
      description: 'Riñonera de nylon resistente, ideal para festivales o paseos.',
      photoId: '1548036328-c9fa89d128fa' },
  ],
  other: [
    { title: 'Bufanda de lana extra larga', brand: 'Zara', color: 'Gris', size: 'U',
      description: 'Bufanda de lana 100%, súper abrigada. Color gris oscuro versátil.',
      photoId: '1520903920243-00d872a2d1c9' },
    { title: 'Kimono estampado', brand: 'Mango', color: 'Multicolor', size: 'M',
      description: 'Kimono liviano con estampa oriental. Queda ideal sobre tops básicos.',
      photoId: '1490481651871-ab68de25d43d' },
    { title: 'Conjunto deportivo set', brand: 'Nike', color: 'Rosa', size: 'S',
      description: 'Set deportivo: top + calza, color rosa pastel. Tela con secado rápido.',
      photoId: '1556906781-9a412961c28c' },
    { title: 'Pijama de algodón', brand: 'Calvin Klein', color: 'Rosa', size: 'M',
      description: 'Pijama de dos piezas en algodón puro. Comodísimo, prácticamente nuevo.',
      photoId: '1571513722275-4b41940f54b8' },
  ],
};

const slugify = (str) =>
  str
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 30);

function buildFixtures(passwordHash) {
  const users = [];
  const garments = [];
  const images = [];
  const seenUsernames = new Set();
  const seenEmails = new Set();
  const poolCursors = Object.fromEntries(CATEGORIES.map((c) => [c, 0]));

  for (let i = 0; i < COUNT; i += 1) {
    const first = FIRST_NAMES[i % FIRST_NAMES.length];
    const last = LAST_NAMES[(i * 7) % LAST_NAMES.length];
    const baseUsername = `${slugify(first)}_${slugify(last)}`;
    let username = baseUsername;
    let suffix = 1;
    while (seenUsernames.has(username)) {
      suffix += 1;
      username = `${baseUsername}${suffix}`;
    }
    seenUsernames.add(username);

    let email = `${username}@swapstyle.test`;
    while (seenEmails.has(email)) {
      email = `${username}.${Math.floor(Math.random() * 1000)}@swapstyle.test`;
    }
    seenEmails.add(email);

    const [city, country] = CITIES[i % CITIES.length];
    const gender = GENDERS[i % GENDERS.length];
    const birthYear = 1985 + (i % 20);
    const birthMonth = ((i * 3) % 12) + 1;
    const birthDay = ((i * 7) % 27) + 1;
    const birthdate = `${birthYear}-${String(birthMonth).padStart(2, '0')}-${String(birthDay).padStart(2, '0')}`;

    users.push({
      id: null,
      email,
      passwordHash,
      name: `${first} ${last}`,
      username,
      birthdate,
      gender,
      bio: `Hola! Soy ${first}, vivo en ${city}. Amante de la moda circular y los buenos intercambios.`,
      avatarUrl: `https://i.pravatar.cc/300?img=${(i % 70) + 1}`,
      city,
      country,
      isPremium: i % 10 === 0,
    });

    const category = CATEGORIES[i % CATEGORIES.length];
    const pool = GARMENT_POOLS[category];
    const tpl = pool[poolCursors[category] % pool.length];
    poolCursors[category] += 1;
    const condition = CONDITIONS[i % CONDITIONS.length];

    garments.push({
      ownerIndex: i,
      title: tpl.title,
      description: tpl.description,
      category,
      brand: tpl.brand,
      size: tpl.size,
      color: tpl.color,
      condition,
    });

    images.push({
      garmentIndex: i,
      url: `https://images.unsplash.com/photo-${tpl.photoId}?w=800&h=1000&fit=crop&q=80`,
      position: 0,
    });
  }

  return { users, garments, images };
}

async function main() {
  const client = new Client({
    // Mismo criterio que database.module.ts: DATABASE_URL gana sobre los sueltos.
    ...(process.env.DATABASE_URL
      ? { connectionString: process.env.DATABASE_URL }
      : {
          host: process.env.POSTGRES_HOST || 'localhost',
          port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
          user: process.env.POSTGRES_USER || 'swapstyle',
          password: process.env.POSTGRES_PASSWORD || 'swapstyle_dev',
          database: process.env.POSTGRES_DB || 'swapstyle',
        }),
    // Supabase firma con su propia CA. Se pinea igual que en el backend, en vez
    // de apagar la verificación: `rejectUnauthorized: false` acepta cualquier
    // certificado y manda la password de la base a quien esté en el medio.
    ...(process.env.POSTGRES_SSL === 'true' ? { ssl: { ca: process.env.POSTGRES_CA || supabaseRootCa() } } : {}),
  });

  await client.connect();
  console.log('Conectado a Postgres.');

  console.log(`Hasheando contraseña "${PASSWORD_PLAIN}" con argon2id...`);
  const passwordHash = await argon2.hash(PASSWORD_PLAIN, { type: argon2.argon2id });

  const { users, garments, images } = buildFixtures(passwordHash);
  console.log(`Generados ${users.length} usuarios, ${garments.length} prendas, ${images.length} imágenes.`);

  try {
    await client.query('BEGIN');

    const userIds = [];
    for (const u of users) {
      const res = await client.query(
        `INSERT INTO users (email, password_hash, name, username, birthdate, gender, bio,
                            avatar_url, city, country, email_verified, is_premium, super_likes_remaining)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,true,$11,$12)
         RETURNING id`,
        [
          u.email, u.passwordHash, u.name, u.username, u.birthdate, u.gender, u.bio,
          u.avatarUrl, u.city, u.country, u.isPremium, u.isPremium ? 5 : 1,
        ],
      );
      userIds.push(res.rows[0].id);
    }
    console.log(`✔ Insertados ${userIds.length} usuarios.`);

    const garmentIds = [];
    for (const g of garments) {
      const res = await client.query(
        `INSERT INTO garments (owner_id, title, description, category, brand, size, color, condition, status, is_premium)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'available',false)
         RETURNING id`,
        [
          userIds[g.ownerIndex], g.title, g.description, g.category,
          g.brand, g.size, g.color, g.condition,
        ],
      );
      garmentIds.push(res.rows[0].id);
    }
    console.log(`✔ Insertadas ${garmentIds.length} prendas.`);

    let imgCount = 0;
    for (const img of images) {
      await client.query(
        `INSERT INTO garment_images (garment_id, url, position) VALUES ($1, $2, $3)`,
        [garmentIds[img.garmentIndex], img.url, img.position],
      );
      imgCount += 1;
    }
    console.log(`✔ Insertadas ${imgCount} imágenes.`);

    await client.query('COMMIT');
    console.log('\n✅ Seed completado en transacción.');
    console.log(`   Login con cualquier email "<usuario>@swapstyle.test" y password "${PASSWORD_PLAIN}".`);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error en seed, rollback aplicado:', error);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
