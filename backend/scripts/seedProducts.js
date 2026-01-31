/**
 * Seed script to populate the database with sample footwear products and reviews
 * Run: node backend/scripts/seedProducts.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Product = require('../src/models/Product');
const User = require('../src/models/User');

// Sample user names for reviews
const reviewerNames = [
  'Nguyễn Văn An',
  'Trần Thị Bình',
  'Lê Hoàng Cường',
  'Phạm Minh Đức',
  'Hoàng Thị Em',
  'Vũ Quang Phúc',
  'Đặng Thị Giang',
  'Bùi Văn Hải',
  'Ngô Thị Hương',
  'Đinh Văn Khoa',
  'Lý Thị Lan',
  'Trương Văn Minh',
  'Mai Thị Ngọc',
  'Đỗ Văn Phong',
  'Hồ Thị Quỳnh',
];

// Sample review comments
const positiveComments = [
  'Sản phẩm rất đẹp, đúng như mô tả. Giao hàng nhanh chóng!',
  'Chất lượng tuyệt vời, đi rất êm chân. Sẽ mua lại!',
  'Giày đẹp, đóng gói cẩn thận. Rất hài lòng với sản phẩm này.',
  'Đúng size, màu sắc đẹp như hình. Recommend cho mọi người!',
  'Mang rất thoải mái, chất liệu tốt. Đáng đồng tiền bát gạo.',
  'Thiết kế đẹp, phối đồ dễ dàng. Rất thích sản phẩm này!',
  'Giày nhẹ, êm, phù hợp đi bộ hàng ngày. 5 sao!',
  'Chất lượng vượt mong đợi so với giá tiền. Sẽ giới thiệu cho bạn bè.',
  'Đã mua 2 đôi rồi, rất ưng ý. Shop giao hàng siêu nhanh!',
  'Giày đẹp lắm, con trai mình rất thích. Cảm ơn shop!',
];

const neutralComments = [
  'Sản phẩm ổn, đúng với giá tiền. Giao hàng hơi lâu một chút.',
  'Giày đẹp nhưng hơi chật, nên lấy lên 1 size.',
  'Chất lượng khá, mẫu mã đẹp. Mong shop cải thiện thời gian giao hàng.',
  'Sản phẩm tạm được, không quá xuất sắc nhưng cũng không tệ.',
  'Giày ok, nhưng màu sắc thực tế hơi khác so với hình.',
];

const negativeComments = [
  'Giày hơi cứng ban đầu, cần thời gian để làm quen.',
  'Giao hàng chậm, nhưng sản phẩm thì ổn.',
];

// Generate random reviews for a product
const generateReviews = (count) => {
  const reviews = [];
  const usedNames = new Set();

  for (let i = 0; i < count; i++) {
    // Get unique reviewer name
    let name;
    do {
      name = reviewerNames[Math.floor(Math.random() * reviewerNames.length)];
    } while (usedNames.has(name) && usedNames.size < reviewerNames.length);
    usedNames.add(name);

    // Generate rating (weighted towards positive)
    const rand = Math.random();
    let rating;
    if (rand < 0.4) rating = 5;
    else if (rand < 0.7) rating = 4;
    else if (rand < 0.85) rating = 3;
    else if (rand < 0.95) rating = 2;
    else rating = 1;

    // Select appropriate comment based on rating
    let comment;
    if (rating >= 4) {
      comment = positiveComments[Math.floor(Math.random() * positiveComments.length)];
    } else if (rating === 3) {
      comment = neutralComments[Math.floor(Math.random() * neutralComments.length)];
    } else {
      comment = negativeComments[Math.floor(Math.random() * negativeComments.length)];
    }

    // Generate random date within last 6 months
    const daysAgo = Math.floor(Math.random() * 180);
    const reviewDate = new Date();
    reviewDate.setDate(reviewDate.getDate() - daysAgo);

    reviews.push({
      userId: new mongoose.Types.ObjectId(),
      userName: name,
      rating,
      title: rating >= 4 ? 'Rất hài lòng!' : rating === 3 ? 'Tạm ổn' : 'Cần cải thiện',
      comment,
      verified: Math.random() > 0.3, // 70% verified purchases
      createdAt: reviewDate,
      updatedAt: reviewDate,
    });
  }

  return reviews;
};

// Calculate average rating from reviews
const calculateRating = (reviews) => {
  if (reviews.length === 0) return 0;
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  return Math.round((sum / reviews.length) * 10) / 10;
};

const sampleProducts = [
  // ========== MEN'S SHOES ==========
  {
    name: 'Nike Air Max 270 React',
    description: 'Experience ultimate comfort with the Nike Air Max 270 React. Featuring a large Max Air unit and soft React foam, this shoe delivers a super-smooth ride for all-day wear.',
    price: 3500000,
    discount: 15,
    category: 'Men',
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800',
      'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800',
    ],
    sizes: [
      { size: '39', stock: 5 },
      { size: '40', stock: 8 },
      { size: '41', stock: 10 },
      { size: '42', stock: 12 },
      { size: '43', stock: 7 },
      { size: '44', stock: 4 },
    ],
    reviewCount: 8,
  },
  {
    name: 'Adidas Ultraboost 22',
    description: 'The Adidas Ultraboost 22 is designed for high-performance running with responsive Boost cushioning and a supportive Primeknit upper.',
    price: 4200000,
    discount: 0,
    category: 'Men',
    images: [
      'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800',
    ],
    sizes: [
      { size: '40', stock: 6 },
      { size: '41', stock: 9 },
      { size: '42', stock: 11 },
      { size: '43', stock: 8 },
      { size: '44', stock: 5 },
    ],
    reviewCount: 12,
  },
  {
    name: 'New Balance 990v5',
    description: 'The classic New Balance 990v5 combines premium materials with legendary comfort. Made in the USA with premium ENCAP midsole technology.',
    price: 4800000,
    discount: 10,
    category: 'Men',
    images: [
      'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=800',
    ],
    sizes: [
      { size: '40', stock: 4 },
      { size: '41', stock: 7 },
      { size: '42', stock: 9 },
      { size: '43', stock: 6 },
      { size: '44', stock: 3 },
    ],
    reviewCount: 6,
  },
  {
    name: 'Nike Air Jordan 1 Retro High',
    description: 'The shoe that started it all. The Air Jordan 1 Retro High brings back the classic silhouette with premium leather and iconic colorways.',
    price: 5200000,
    discount: 0,
    category: 'Men',
    images: [
      'https://images.unsplash.com/photo-1597045566677-8cf032ed6634?w=800',
    ],
    sizes: [
      { size: '40', stock: 3 },
      { size: '41', stock: 5 },
      { size: '42', stock: 7 },
      { size: '43', stock: 4 },
      { size: '44', stock: 2 },
    ],
    reviewCount: 15,
  },
  {
    name: 'Puma Suede Classic XXI',
    description: 'The Puma Suede has been a street icon since 1968. This modern version stays true to the original with premium suede and a rubber cupsole.',
    price: 2200000,
    discount: 20,
    category: 'Men',
    images: [
      'https://images.unsplash.com/photo-1608379743498-9be9e4c1d9a4?w=800',
    ],
    sizes: [
      { size: '39', stock: 8 },
      { size: '40', stock: 10 },
      { size: '41', stock: 12 },
      { size: '42', stock: 9 },
      { size: '43', stock: 6 },
    ],
    reviewCount: 7,
  },
  {
    name: 'Asics Gel-Kayano 29',
    description: 'Engineered for stability and comfort, the Gel-Kayano 29 features advanced GEL technology and a supportive heel counter for overpronators.',
    price: 3900000,
    discount: 15,
    category: 'Men',
    images: [
      'https://images.unsplash.com/photo-1595341888016-a392ef81b7de?w=800',
    ],
    sizes: [
      { size: '40', stock: 5 },
      { size: '41', stock: 8 },
      { size: '42', stock: 10 },
      { size: '43', stock: 7 },
      { size: '44', stock: 4 },
    ],
    reviewCount: 9,
  },
  {
    name: 'Nike Dunk Low Retro',
    description: 'Created for the hardwood but taken to the streets, the Nike Dunk Low Retro returns with crisp overlays and classic hoops style.',
    price: 2900000,
    discount: 0,
    category: 'Men',
    images: [
      'https://images.unsplash.com/photo-1612015670817-0127d21628d4?w=800',
    ],
    sizes: [
      { size: '40', stock: 4 },
      { size: '41', stock: 6 },
      { size: '42', stock: 8 },
      { size: '43', stock: 5 },
      { size: '44', stock: 3 },
    ],
    reviewCount: 11,
  },
  {
    name: 'Adidas Forum Low',
    description: 'Born on the basketball court in 1984, the Adidas Forum Low brings retro vibes with its distinctive X-strap and soft leather upper.',
    price: 2600000,
    discount: 25,
    category: 'Men',
    images: [
      'https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=800',
    ],
    sizes: [
      { size: '39', stock: 6 },
      { size: '40', stock: 9 },
      { size: '41', stock: 11 },
      { size: '42', stock: 8 },
      { size: '43', stock: 5 },
    ],
    reviewCount: 5,
  },

  // ========== WOMEN'S SHOES ==========
  {
    name: 'Nike Air Zoom Pegasus 39',
    description: 'The workhorse with wings returns. The Nike Air Zoom Pegasus 39 continues to put a spring in your step with responsive Zoom Air cushioning.',
    price: 3200000,
    discount: 20,
    category: 'Women',
    images: [
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800',
    ],
    sizes: [
      { size: '36', stock: 6 },
      { size: '37', stock: 10 },
      { size: '38', stock: 12 },
      { size: '39', stock: 8 },
      { size: '40', stock: 5 },
    ],
    reviewCount: 10,
  },
  {
    name: 'Adidas NMD R1',
    description: 'The Adidas NMD R1 blends progressive design with a cozy feel. The stretchy knit upper and Boost midsole deliver street-ready comfort.',
    price: 3800000,
    discount: 25,
    category: 'Women',
    images: [
      'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=800',
    ],
    sizes: [
      { size: '36', stock: 8 },
      { size: '37', stock: 11 },
      { size: '38', stock: 9 },
      { size: '39', stock: 6 },
      { size: '40', stock: 4 },
    ],
    reviewCount: 8,
  },
  {
    name: 'Converse Chuck Taylor All Star',
    description: 'The iconic Converse Chuck Taylor All Star. A timeless classic that never goes out of style with durable canvas upper and rubber sole.',
    price: 1500000,
    discount: 0,
    category: 'Women',
    images: [
      'https://images.unsplash.com/photo-1607522370275-f14206abe5d3?w=800',
    ],
    sizes: [
      { size: '36', stock: 15 },
      { size: '37', stock: 18 },
      { size: '38', stock: 20 },
      { size: '39', stock: 14 },
      { size: '40', stock: 10 },
    ],
    reviewCount: 14,
  },
  {
    name: 'Nike Air Force 1 Low White',
    description: 'The radiance lives on in the Nike Air Force 1 Low. This icon of hoops culture delivers crisp leather, bold colors, and the perfect finish.',
    price: 2800000,
    discount: 0,
    category: 'Women',
    images: [
      'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800',
    ],
    sizes: [
      { size: '36', stock: 10 },
      { size: '37', stock: 14 },
      { size: '38', stock: 16 },
      { size: '39', stock: 12 },
      { size: '40', stock: 8 },
    ],
    reviewCount: 13,
  },
  {
    name: 'New Balance 574',
    description: 'A legendary silhouette, the New Balance 574 offers an iconic blend of style and comfort with ENCAP midsole cushioning.',
    price: 2400000,
    discount: 15,
    category: 'Women',
    images: [
      'https://images.unsplash.com/photo-1539185441755-769473a23570?w=800',
    ],
    sizes: [
      { size: '36', stock: 7 },
      { size: '37', stock: 10 },
      { size: '38', stock: 12 },
      { size: '39', stock: 9 },
      { size: '40', stock: 6 },
    ],
    reviewCount: 6,
  },
  {
    name: 'Reebok Classic Leather',
    description: 'The Reebok Classic Leather has been a staple since 1983. Soft leather upper and EVA midsole provide lasting comfort.',
    price: 2100000,
    discount: 30,
    category: 'Women',
    images: [
      'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=800',
    ],
    sizes: [
      { size: '36', stock: 9 },
      { size: '37', stock: 12 },
      { size: '38', stock: 14 },
      { size: '39', stock: 10 },
      { size: '40', stock: 7 },
    ],
    reviewCount: 4,
  },
  {
    name: 'Adidas Stan Smith',
    description: 'Clean, simple, and sophisticated. The Adidas Stan Smith is a tennis icon with a smooth leather upper and signature green heel tab.',
    price: 2500000,
    discount: 10,
    category: 'Women',
    images: [
      'https://images.unsplash.com/photo-1603808033192-082d6919d3e1?w=800',
    ],
    sizes: [
      { size: '36', stock: 8 },
      { size: '37', stock: 11 },
      { size: '38', stock: 13 },
      { size: '39', stock: 9 },
      { size: '40', stock: 6 },
    ],
    reviewCount: 9,
  },
  {
    name: 'Nike Blazer Mid 77',
    description: 'Vintage vibes in every step. The Nike Blazer Mid 77 returns with stitched overlays and a worn-in look for classic basketball style.',
    price: 2700000,
    discount: 0,
    category: 'Women',
    images: [
      'https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=800',
    ],
    sizes: [
      { size: '36', stock: 5 },
      { size: '37', stock: 8 },
      { size: '38', stock: 10 },
      { size: '39', stock: 7 },
      { size: '40', stock: 4 },
    ],
    reviewCount: 7,
  },

  // ========== KIDS' SHOES ==========
  {
    name: 'Nike Air Force 1 Kids',
    description: 'The legendary Nike Air Force 1 in a kid-friendly design. Features the same classic style with comfortable cushioning for active kids.',
    price: 2200000,
    discount: 0,
    category: 'Kids',
    images: [
      'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=800',
    ],
    sizes: [
      { size: '28', stock: 8 },
      { size: '29', stock: 10 },
      { size: '30', stock: 12 },
      { size: '31', stock: 10 },
      { size: '32', stock: 8 },
      { size: '33', stock: 6 },
    ],
    reviewCount: 11,
  },
  {
    name: 'Adidas Stan Smith Kids',
    description: 'The Adidas Stan Smith for kids brings the same clean tennis style to little feet with a soft leather upper and classic green heel tab.',
    price: 1800000,
    discount: 15,
    category: 'Kids',
    images: [
      'https://images.unsplash.com/photo-1603808033192-082d6919d3e1?w=800',
    ],
    sizes: [
      { size: '28', stock: 10 },
      { size: '29', stock: 12 },
      { size: '30', stock: 14 },
      { size: '31', stock: 11 },
      { size: '32', stock: 9 },
      { size: '33', stock: 7 },
    ],
    reviewCount: 8,
  },
  {
    name: 'New Balance 574 Kids',
    description: 'The iconic New Balance 574 sized for kids. Comfortable cushioning and durable materials perfect for everyday adventures.',
    price: 1600000,
    discount: 20,
    category: 'Kids',
    images: [
      'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=800',
    ],
    sizes: [
      { size: '28', stock: 7 },
      { size: '29', stock: 9 },
      { size: '30', stock: 11 },
      { size: '31', stock: 9 },
      { size: '32', stock: 7 },
      { size: '33', stock: 5 },
    ],
    reviewCount: 6,
  },
  {
    name: 'Converse Chuck Taylor Kids',
    description: 'Timeless style for little ones. The Converse Chuck Taylor for kids features a durable canvas upper and classic rubber sole.',
    price: 1200000,
    discount: 10,
    category: 'Kids',
    images: [
      'https://images.unsplash.com/photo-1607522370275-f14206abe5d3?w=800',
    ],
    sizes: [
      { size: '28', stock: 12 },
      { size: '29', stock: 14 },
      { size: '30', stock: 16 },
      { size: '31', stock: 13 },
      { size: '32', stock: 10 },
      { size: '33', stock: 8 },
    ],
    reviewCount: 10,
  },
  {
    name: 'Nike Revolution 6 Kids',
    description: 'Built for speedy kids, the Nike Revolution 6 offers lightweight cushioning and a secure fit for running and playing.',
    price: 1400000,
    discount: 25,
    category: 'Kids',
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800',
    ],
    sizes: [
      { size: '28', stock: 9 },
      { size: '29', stock: 11 },
      { size: '30', stock: 13 },
      { size: '31', stock: 11 },
      { size: '32', stock: 8 },
      { size: '33', stock: 6 },
    ],
    reviewCount: 5,
  },
  {
    name: 'Adidas Superstar Kids',
    description: 'The legendary shell-toe design for kids. Adidas Superstar brings iconic style with a leather upper and rubber shell toe.',
    price: 1900000,
    discount: 0,
    category: 'Kids',
    images: [
      'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800',
    ],
    sizes: [
      { size: '28', stock: 6 },
      { size: '29', stock: 8 },
      { size: '30', stock: 10 },
      { size: '31', stock: 8 },
      { size: '32', stock: 6 },
      { size: '33', stock: 4 },
    ],
    reviewCount: 7,
  },

  // ========== CASUAL SHOES ==========
  {
    name: 'Vans Old Skool',
    description: 'The Vans Old Skool is a classic skate shoe with the iconic side stripe, sturdy canvas and suede upper, and signature waffle outsole.',
    price: 1800000,
    discount: 10,
    category: 'Casual',
    images: [
      'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=800',
    ],
    sizes: [
      { size: '38', stock: 12 },
      { size: '39', stock: 15 },
      { size: '40', stock: 18 },
      { size: '41', stock: 14 },
      { size: '42', stock: 10 },
      { size: '43', stock: 8 },
    ],
    reviewCount: 12,
  },
  {
    name: 'Puma RS-X Reinvention',
    description: 'The Puma RS-X takes inspiration from the 80s Running System line, reimagined with bold colors and chunky proportions for today.',
    price: 2800000,
    discount: 30,
    category: 'Casual',
    images: [
      'https://images.unsplash.com/photo-1608379743498-9be9e4c1d9a4?w=800',
    ],
    sizes: [
      { size: '39', stock: 6 },
      { size: '40', stock: 9 },
      { size: '41', stock: 11 },
      { size: '42', stock: 8 },
      { size: '43', stock: 5 },
    ],
    reviewCount: 8,
  },
  {
    name: 'Vans Sk8-Hi',
    description: 'The legendary Vans Sk8-Hi. The original skate high-top with padded collars, suede and canvas upper, and iconic waffle sole.',
    price: 2000000,
    discount: 0,
    category: 'Casual',
    images: [
      'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=800',
    ],
    sizes: [
      { size: '38', stock: 8 },
      { size: '39', stock: 11 },
      { size: '40', stock: 14 },
      { size: '41', stock: 11 },
      { size: '42', stock: 8 },
      { size: '43', stock: 6 },
    ],
    reviewCount: 9,
  },
  {
    name: 'Fila Disruptor II',
    description: 'The chunky sneaker that started a trend. Fila Disruptor II features a thick EVA midsole and aggressive traction pattern.',
    price: 2300000,
    discount: 35,
    category: 'Casual',
    images: [
      'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=800',
    ],
    sizes: [
      { size: '36', stock: 7 },
      { size: '37', stock: 10 },
      { size: '38', stock: 12 },
      { size: '39', stock: 9 },
      { size: '40', stock: 6 },
    ],
    reviewCount: 6,
  },
  {
    name: 'Converse Run Star Hike',
    description: 'A modern twist on the classic. The Run Star Hike features an exaggerated platform and jagged sole for statement-making style.',
    price: 2600000,
    discount: 15,
    category: 'Casual',
    images: [
      'https://images.unsplash.com/photo-1607522370275-f14206abe5d3?w=800',
    ],
    sizes: [
      { size: '36', stock: 5 },
      { size: '37', stock: 8 },
      { size: '38', stock: 10 },
      { size: '39', stock: 7 },
      { size: '40', stock: 4 },
    ],
    reviewCount: 4,
  },
  {
    name: 'Nike Cortez',
    description: 'The original Nike running icon. The Nike Cortez returns with its sleek leather upper and classic herringbone outsole.',
    price: 2400000,
    discount: 0,
    category: 'Casual',
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800',
    ],
    sizes: [
      { size: '38', stock: 6 },
      { size: '39', stock: 9 },
      { size: '40', stock: 12 },
      { size: '41', stock: 9 },
      { size: '42', stock: 6 },
      { size: '43', stock: 4 },
    ],
    reviewCount: 7,
  },

  // ========== SPORT SHOES ==========
  {
    name: 'Nike Metcon 8',
    description: 'The Nike Metcon 8 is built for heavy lifting and high-intensity training. Features a wide, flat heel for stability and a textured rubber wrap.',
    price: 3600000,
    discount: 0,
    category: 'Sport',
    images: [
      'https://images.unsplash.com/photo-1605348532760-6753d2c43329?w=800',
    ],
    sizes: [
      { size: '40', stock: 5 },
      { size: '41', stock: 8 },
      { size: '42', stock: 10 },
      { size: '43', stock: 7 },
      { size: '44', stock: 4 },
    ],
    reviewCount: 11,
  },
  {
    name: 'Reebok Nano X3',
    description: 'The Reebok Nano X3 is designed for CrossFit athletes. Features a Floatride Energy Foam midsole and Flexweave upper for versatile training.',
    price: 3400000,
    discount: 20,
    category: 'Sport',
    images: [
      'https://images.unsplash.com/photo-1539185441755-769473a23570?w=800',
    ],
    sizes: [
      { size: '40', stock: 6 },
      { size: '41', stock: 9 },
      { size: '42', stock: 11 },
      { size: '43', stock: 8 },
      { size: '44', stock: 5 },
    ],
    reviewCount: 8,
  },
  {
    name: 'Adidas Adizero Adios Pro 3',
    description: 'Built for speed, the Adizero Adios Pro 3 features Lightstrike Pro cushioning and an Energyrods system for explosive performance.',
    price: 5500000,
    discount: 10,
    category: 'Sport',
    images: [
      'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800',
    ],
    sizes: [
      { size: '40', stock: 3 },
      { size: '41', stock: 5 },
      { size: '42', stock: 7 },
      { size: '43', stock: 5 },
      { size: '44', stock: 3 },
    ],
    reviewCount: 5,
  },
  {
    name: 'Nike ZoomX Vaporfly NEXT% 2',
    description: 'The racing shoe that changed everything. The Vaporfly NEXT% 2 features ZoomX foam and a full-length carbon fiber plate.',
    price: 6200000,
    discount: 0,
    category: 'Sport',
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800',
    ],
    sizes: [
      { size: '40', stock: 2 },
      { size: '41', stock: 4 },
      { size: '42', stock: 6 },
      { size: '43', stock: 4 },
      { size: '44', stock: 2 },
    ],
    reviewCount: 9,
  },
  {
    name: 'Under Armour HOVR Phantom 3',
    description: 'Feel connected with UA HOVR technology. The Phantom 3 provides a zero-gravity feel with responsive cushioning and a breathable knit upper.',
    price: 3800000,
    discount: 25,
    category: 'Sport',
    images: [
      'https://images.unsplash.com/photo-1595341888016-a392ef81b7de?w=800',
    ],
    sizes: [
      { size: '40', stock: 5 },
      { size: '41', stock: 7 },
      { size: '42', stock: 9 },
      { size: '43', stock: 6 },
      { size: '44', stock: 4 },
    ],
    reviewCount: 6,
  },
  {
    name: 'Brooks Ghost 15',
    description: 'Smooth transitions and soft cushioning define the Brooks Ghost 15. DNA LOFT cushioning provides a balanced feel for daily training.',
    price: 3300000,
    discount: 15,
    category: 'Sport',
    images: [
      'https://images.unsplash.com/photo-1539185441755-769473a23570?w=800',
    ],
    sizes: [
      { size: '40', stock: 6 },
      { size: '41', stock: 8 },
      { size: '42', stock: 10 },
      { size: '43', stock: 7 },
      { size: '44', stock: 5 },
    ],
    reviewCount: 10,
  },
  {
    name: 'Hoka One One Clifton 9',
    description: 'Maximum cushion, minimal weight. The Hoka Clifton 9 offers a plush ride with improved breathability and a responsive midsole.',
    price: 3700000,
    discount: 0,
    category: 'Sport',
    images: [
      'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800',
    ],
    sizes: [
      { size: '40', stock: 4 },
      { size: '41', stock: 6 },
      { size: '42', stock: 8 },
      { size: '43', stock: 6 },
      { size: '44', stock: 4 },
    ],
    reviewCount: 8,
  },
  {
    name: 'Saucony Endorphin Speed 3',
    description: 'Speed-focused training shoe with a nylon plate for propulsion. The Endorphin Speed 3 delivers race-day performance for everyday runs.',
    price: 4100000,
    discount: 20,
    category: 'Sport',
    images: [
      'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=800',
    ],
    sizes: [
      { size: '40', stock: 4 },
      { size: '41', stock: 6 },
      { size: '42', stock: 8 },
      { size: '43', stock: 5 },
      { size: '44', stock: 3 },
    ],
    reviewCount: 7,
  },
];

// Process products with stock calculation and reviews
const processProducts = () => {
  return sampleProducts.map((product) => {
    const reviews = generateReviews(product.reviewCount || 5);
    const rating = calculateRating(reviews);
    const totalStock = product.sizes.reduce((sum, s) => sum + s.stock, 0);

    return {
      ...product,
      totalStock,
      rating,
      reviews,
      reviewCount: reviews.length,
      isActive: true,
    };
  });
};

const seedDatabase = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Clear existing products
    console.log('🗑️  Clearing existing products...');
    await Product.deleteMany({});

    // Process and insert products with reviews
    console.log('📦 Processing products and generating reviews...');
    const productsToInsert = processProducts();

    console.log('💾 Inserting products into database...');
    const result = await Product.insertMany(productsToInsert);

    // Summary
    const totalReviews = result.reduce((sum, p) => sum + p.reviews.length, 0);
    const categories = [...new Set(result.map((p) => p.category))];

    console.log('\n' + '='.repeat(50));
    console.log('✅ SEEDING COMPLETED SUCCESSFULLY!');
    console.log('='.repeat(50));
    console.log(`📦 Total products: ${result.length}`);
    console.log(`⭐ Total reviews: ${totalReviews}`);
    console.log(`📂 Categories: ${categories.join(', ')}`);
    console.log('\n📋 Products by category:');

    categories.forEach((cat) => {
      const catProducts = result.filter((p) => p.category === cat);
      const catReviews = catProducts.reduce((sum, p) => sum + p.reviews.length, 0);
      console.log(`   ${cat}: ${catProducts.length} products, ${catReviews} reviews`);
    });

    console.log('\n📝 Sample products:');
    result.slice(0, 5).forEach((product) => {
      console.log(`   - ${product.name} (${product.category}) - ⭐${product.rating} (${product.reviews.length} reviews)`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
