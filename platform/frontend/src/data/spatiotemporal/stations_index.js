// 57 SELECTABLE STATION HUBS DIRECTORY
// Categorized across 19 regional hubs for TicketForge UI dropdown & search engine

export const SELECTABLE_STATIONS = [
  // Delhi NCR (4)
  { code: 'NDLS', name: 'NDLS - New Delhi', city: 'New Delhi', region: 'Delhi NCR' },
  { code: 'DLI', name: 'DLI - Old Delhi', city: 'New Delhi', region: 'Delhi NCR' },
  { code: 'NZM', name: 'NZM - Hazrat Nizamuddin', city: 'New Delhi', region: 'Delhi NCR' },
  { code: 'ANVT', name: 'ANVT - Anand Vihar Terminal', city: 'New Delhi', region: 'Delhi NCR' },

  // Mumbai Metro (4)
  { code: 'MMCT', name: 'MMCT - Mumbai Central', city: 'Mumbai', region: 'Mumbai Metro' },
  { code: 'CSMT', name: 'CSMT - Mumbai CSMT', city: 'Mumbai', region: 'Mumbai Metro' },
  { code: 'BDTS', name: 'BDTS - Bandra Terminus', city: 'Mumbai', region: 'Mumbai Metro' },
  { code: 'LTT', name: 'LTT - Lokmanya Tilak Terminus', city: 'Mumbai', region: 'Mumbai Metro' },

  // Kolkata Metro (2)
  { code: 'HWH', name: 'HWH - Howrah Jn', city: 'Kolkata', region: 'Kolkata Metro' },
  { code: 'SDAH', name: 'SDAH - Sealdah', city: 'Kolkata', region: 'Kolkata Metro' },

  // Bengaluru Hub (2)
  { code: 'SBC', name: 'SBC - KSR Bengaluru', city: 'Bengaluru', region: 'Bengaluru Hub' },
  { code: 'YPR', name: 'YPR - Yesvantpur Jn', city: 'Bengaluru', region: 'Bengaluru Hub' },

  // Chennai Hub (2)
  { code: 'MAS', name: 'MAS - Chennai Central', city: 'Chennai', region: 'Chennai Hub' },
  { code: 'MS', name: 'MS - Chennai Egmore', city: 'Chennai', region: 'Chennai Hub' },

  // Hyderabad Hub (2)
  { code: 'HYB', name: 'HYB - Hyderabad Deccan', city: 'Hyderabad', region: 'Hyderabad Hub' },
  { code: 'SC', name: 'SC - Secunderabad Jn', city: 'Hyderabad', region: 'Hyderabad Hub' },

  // Uttar Pradesh (6)
  { code: 'LKO', name: 'LKO - Lucknow Charbagh', city: 'Lucknow', region: 'Uttar Pradesh' },
  { code: 'CNB', name: 'CNB - Kanpur Central', city: 'Kanpur', region: 'Uttar Pradesh' },
  { code: 'BSB', name: 'BSB - Varanasi Jn', city: 'Varanasi', region: 'Uttar Pradesh' },
  { code: 'AY', name: 'AY - Ayodhya Dham', city: 'Ayodhya', region: 'Uttar Pradesh' },
  { code: 'GKP', name: 'GKP - Gorakhpur Jn', city: 'Gorakhpur', region: 'Uttar Pradesh' },
  { code: 'VGLJ', name: 'VGLJ - VGL Jhansi Jn', city: 'Jhansi', region: 'Uttar Pradesh' },

  // Bihar & Jharkhand (3)
  { code: 'PNBE', name: 'PNBE - Patna Jn', city: 'Patna', region: 'Bihar & Jharkhand' },
  { code: 'RNC', name: 'RNC - Ranchi Jn', city: 'Ranchi', region: 'Bihar & Jharkhand' },
  { code: 'TATA', name: 'TATA - Tatanagar Jn', city: 'Jamshedpur', region: 'Bihar & Jharkhand' },

  // Punjab, Haryana & Chandigarh (3)
  { code: 'CDG', name: 'CDG - Chandigarh', city: 'Chandigarh', region: 'North West' },
  { code: 'ASR', name: 'ASR - Amritsar Jn', city: 'Amritsar', region: 'North West' },
  { code: 'FZR', name: 'FZR - Firozpur Cantt', city: 'Firozpur', region: 'North West' },

  // Jammu & Kashmir (2)
  { code: 'JAT', name: 'JAT - Jammu Tawi', city: 'Jammu', region: 'Jammu & Kashmir' },
  { code: 'SVDK', name: 'SVDK - SMVD Katra', city: 'Katra', region: 'Jammu & Kashmir' },

  // Rajasthan (2)
  { code: 'JP', name: 'JP - Jaipur Jn', city: 'Jaipur', region: 'Rajasthan' },
  { code: 'KOTA', name: 'KOTA - Kota Jn', city: 'Kota', region: 'Rajasthan' },

  // Madhya Pradesh (3)
  { code: 'BPL', name: 'BPL - Bhopal Jn', city: 'Bhopal', region: 'Madhya Pradesh' },
  { code: 'INDB', name: 'INDB - Indore Jn', city: 'Indore', region: 'Madhya Pradesh' },
  { code: 'GWL', name: 'GWL - Gwalior Jn', city: 'Gwalior', region: 'Madhya Pradesh' },

  // Gujarat (4)
  { code: 'ADI', name: 'ADI - Ahmedabad Jn', city: 'Ahmedabad', region: 'Gujarat' },
  { code: 'ST', name: 'ST - Surat', city: 'Surat', region: 'Gujarat' },
  { code: 'BRC', name: 'BRC - Vadodara Jn', city: 'Vadodara', region: 'Gujarat' },
  { code: 'RJT', name: 'RJT - Rajkot Jn', city: 'Rajkot', region: 'Gujarat' },

  // Maharashtra (2)
  { code: 'PUNE', name: 'PUNE - Pune Jn', city: 'Pune', region: 'Maharashtra' },
  { code: 'NGP', name: 'NGP - Nagpur Jn', city: 'Nagpur', region: 'Maharashtra' },

  // Goa & Karnataka (3)
  { code: 'MAO', name: 'MAO - Madgaon Jn', city: 'Goa', region: 'Goa & Karnataka' },
  { code: 'MYS', name: 'MYS - Mysuru Jn', city: 'Mysuru', region: 'Goa & Karnataka' },
  { code: 'UBL', name: 'UBL - SSS Hubballi Jn', city: 'Hubballi', region: 'Goa & Karnataka' },

  // Kerala & Tamil Nadu (5)
  { code: 'TVC', name: 'TVC - Thiruvananthapuram Central', city: 'Thiruvananthapuram', region: 'South' },
  { code: 'ERS', name: 'ERS - Ernakulam Jn', city: 'Kochi', region: 'South' },
  { code: 'CLT', name: 'CLT - Kozhikode', city: 'Kozhikode', region: 'South' },
  { code: 'CBE', name: 'CBE - Coimbatore Jn', city: 'Coimbatore', region: 'South' },
  { code: 'MDU', name: 'MDU - Madurai Jn', city: 'Madurai', region: 'South' },

  // Odisha & Chhattisgarh (4)
  { code: 'BBS', name: 'BBS - Bhubaneswar', city: 'Bhubaneswar', region: 'East Central' },
  { code: 'PURI', name: 'PURI - Puri', city: 'Puri', region: 'East Central' },
  { code: 'R', name: 'R - Raipur Jn', city: 'Raipur', region: 'East Central' },
  { code: 'BSP', name: 'BSP - Bilaspur Jn', city: 'Bilaspur', region: 'East Central' },

  // Andhra Pradesh (2)
  { code: 'VSKP', name: 'VSKP - Visakhapatnam', city: 'Visakhapatnam', region: 'Andhra Pradesh' },
  { code: 'BZA', name: 'BZA - Vijayawada Jn', city: 'Vijayawada', region: 'Andhra Pradesh' },

  // Assam & North-East (2)
  { code: 'GHY', name: 'GHY - Guwahati', city: 'Guwahati', region: 'North East' },
  { code: 'AGTL', name: 'AGTL - Agartala', city: 'Agartala', region: 'North East' }
];

export const SELECTABLE_STATION_CODES = SELECTABLE_STATIONS.map(s => s.code);
