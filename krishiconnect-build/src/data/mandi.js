/**
 * Sample mandi dataset — NOT live market data.
 *
 * These rows are illustrative values prepared for the KrishiConnect CA3
 * demonstration. They are deliberately shown with a "Sample data" badge in the UI.
 *
 * The data-access layer (src/services/mandiService.js) is replaceable: to use
 * official Agmarknet data, obtain an API key from data.gov.in and implement
 * `fetchLivePrices` there. Do not relabel these rows as live prices.
 */
export const SAMPLE_PRICE_DATE = '2026-10-30'

export const SAMPLE_MANDI_PRICES = [
  { crop: 'Ragi', cropKn: 'ರಾಗಿ', district: 'Bengaluru Rural', market: 'Doddaballapur APMC', minPrice: 3150, modalPrice: 3425, maxPrice: 3800 },
  { crop: 'Ragi', cropKn: 'ರಾಗಿ', district: 'Tumakuru', market: 'Tumakuru APMC', minPrice: 3050, modalPrice: 3360, maxPrice: 3725 },
  { crop: 'Ragi', cropKn: 'ರಾಗಿ', district: 'Mandya', market: 'Mandya APMC', minPrice: 3200, modalPrice: 3510, maxPrice: 3890 },
  { crop: 'Ragi', cropKn: 'ರಾಗಿ', district: 'Hassan', market: 'Arasikere APMC', minPrice: 3100, modalPrice: 3400, maxPrice: 3760 },
  { crop: 'Paddy', cropKn: 'ಭತ್ತ', district: 'Mandya', market: 'Mandya APMC', minPrice: 2280, modalPrice: 2475, maxPrice: 2680 },
  { crop: 'Paddy', cropKn: 'ಭತ್ತ', district: 'Raichur', market: 'Sindhanur APMC', minPrice: 2200, modalPrice: 2410, maxPrice: 2650 },
  { crop: 'Paddy', cropKn: 'ಭತ್ತ', district: 'Davanagere', market: 'Davanagere APMC', minPrice: 2250, modalPrice: 2440, maxPrice: 2620 },
  { crop: 'Paddy', cropKn: 'ಭತ್ತ', district: 'Shivamogga', market: 'Shivamogga APMC', minPrice: 2310, modalPrice: 2520, maxPrice: 2740 },
  { crop: 'Maize', cropKn: 'ಮೆಕ್ಕೆಜೋಳ', district: 'Davanagere', market: 'Harihar APMC', minPrice: 2050, modalPrice: 2215, maxPrice: 2390 },
  { crop: 'Maize', cropKn: 'ಮೆಕ್ಕೆಜೋಳ', district: 'Ballari', market: 'Ballari APMC', minPrice: 1980, modalPrice: 2160, maxPrice: 2340 },
  { crop: 'Maize', cropKn: 'ಮೆಕ್ಕೆಜೋಳ', district: 'Haveri', market: 'Ranebennur APMC', minPrice: 2090, modalPrice: 2265, maxPrice: 2440 },
  { crop: 'Maize', cropKn: 'ಮೆಕ್ಕೆಜೋಳ', district: 'Belagavi', market: 'Belagavi APMC', minPrice: 2025, modalPrice: 2190, maxPrice: 2375 },
  { crop: 'Tomato', cropKn: 'ಟೊಮೆಟೊ', district: 'Kolar', market: 'Kolar APMC', minPrice: 1200, modalPrice: 1860, maxPrice: 2450 },
  { crop: 'Tomato', cropKn: 'ಟೊಮೆಟೊ', district: 'Chikkaballapura', market: 'Chintamani APMC', minPrice: 1350, modalPrice: 2010, maxPrice: 2680 },
  { crop: 'Tomato', cropKn: 'ಟೊಮೆಟೊ', district: 'Bengaluru Rural', market: 'Binny Mill (Bengaluru) APMC', minPrice: 1450, modalPrice: 2240, maxPrice: 2900 },
  { crop: 'Tomato', cropKn: 'ಟೊಮೆಟೊ', district: 'Ramanagara', market: 'Channapatna APMC', minPrice: 1280, modalPrice: 1975, maxPrice: 2540 },
  { crop: 'Onion', cropKn: 'ಈರುಳ್ಳಿ', district: 'Chitradurga', market: 'Chitradurga APMC', minPrice: 1850, modalPrice: 2280, maxPrice: 2760 },
  { crop: 'Onion', cropKn: 'ಈರುಳ್ಳಿ', district: 'Ballari', market: 'Siruguppa APMC', minPrice: 1720, modalPrice: 2140, maxPrice: 2590 },
  { crop: 'Onion', cropKn: 'ಈರುಳ್ಳಿ', district: 'Dharwad', market: 'Hubballi APMC', minPrice: 1900, modalPrice: 2350, maxPrice: 2820 },
  { crop: 'Onion', cropKn: 'ಈರುಳ್ಳಿ', district: 'Kalaburagi', market: 'Kalaburagi APMC', minPrice: 1680, modalPrice: 2085, maxPrice: 2510 },
  { crop: 'Groundnut', cropKn: 'ಶೇಂಗಾ', district: 'Chitradurga', market: 'Challakere APMC', minPrice: 5480, modalPrice: 6010, maxPrice: 6540 },
  { crop: 'Groundnut', cropKn: 'ಶೇಂಗಾ', district: 'Tumakuru', market: 'Pavagada APMC', minPrice: 5620, modalPrice: 6185, maxPrice: 6710 },
  { crop: 'Groundnut', cropKn: 'ಶೇಂಗಾ', district: 'Raichur', market: 'Raichur APMC', minPrice: 5510, modalPrice: 6090, maxPrice: 6620 },
  { crop: 'Groundnut', cropKn: 'ಶೇಂಗಾ', district: 'Chikkamagaluru', market: 'Kadur APMC', minPrice: 5700, modalPrice: 6270, maxPrice: 6830 },
  { crop: 'Cotton', cropKn: 'ಹತ್ತಿ', district: 'Raichur', market: 'Raichur APMC', minPrice: 7020, modalPrice: 7380, maxPrice: 7740 },
  { crop: 'Cotton', cropKn: 'ಹತ್ತಿ', district: 'Kalaburagi', market: 'Kalaburagi APMC', minPrice: 6950, modalPrice: 7290, maxPrice: 7660 },
  { crop: 'Cotton', cropKn: 'ಹತ್ತಿ', district: 'Dharwad', market: 'Hubballi APMC', minPrice: 7080, modalPrice: 7425, maxPrice: 7810 },
  { crop: 'Cotton', cropKn: 'ಹತ್ತಿ', district: 'Haveri', market: 'Haveri APMC', minPrice: 6990, modalPrice: 7335, maxPrice: 7720 },
  { crop: 'Sugarcane', cropKn: 'ಕಬ್ಬು', district: 'Belagavi', market: 'Belagavi APMC', minPrice: 320, modalPrice: 352, maxPrice: 388 },
  { crop: 'Sugarcane', cropKn: 'ಕಬ್ಬು', district: 'Mandya', market: 'Mandya APMC', minPrice: 335, modalPrice: 366, maxPrice: 402 },
  { crop: 'Sugarcane', cropKn: 'ಕಬ್ಬು', district: 'Vijayapura', market: 'Vijayapura APMC', minPrice: 310, modalPrice: 345, maxPrice: 379 },
  { crop: 'Sugarcane', cropKn: 'ಕಬ್ಬು', district: 'Bagalkot', market: 'Jamkhandi APMC', minPrice: 318, modalPrice: 349, maxPrice: 385 },
].map((row, index) => ({
  id: `sample-${String(index + 1).padStart(3, '0')}`,
  ...row,
  unit: '₹/quintal',
  date: SAMPLE_PRICE_DATE,
  dataSource: 'Sample dataset',
}))
