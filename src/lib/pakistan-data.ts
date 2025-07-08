
export const provinces = [
    'Punjab', 
    'Sindh', 
    'Khyber Pakhtunkhwa', 
    'Balochistan', 
    'Gilgit-Baltistan', 
    'Islamabad Capital Territory', 
    'Azad Jammu & Kashmir'
];

export const citiesByProvince: Record<string, string[]> = {
    'Punjab': ['Lahore', 'Faisalabad', 'Rawalpindi', 'Gujranwala', 'Multan', 'Sialkot', 'Bahawalpur', 'Sargodha', 'Sahiwal', 'Dera Ghazi Khan', 'Jhang', 'Sheikhupura', 'Okara'],
    'Sindh': ['Karachi', 'Hyderabad', 'Sukkur', 'Larkana', 'Mirpur Khas', 'Shaheed Benazirabad', 'Nawabshah', 'Thatta', 'Jacobabad'],
    'Khyber Pakhtunkhwa': ['Peshawar', 'Mardan', 'Abbottabad', 'Swat', 'Dera Ismail Khan', 'Kohat', 'Bannu', 'Mansehra', 'Charsadda'],
    'Balochistan': ['Quetta', 'Khuzdar', 'Turbat', 'Loralai', 'Gwadar', 'Chaman', 'Sibi'],
    'Gilgit-Baltistan': ['Gilgit', 'Skardu', 'Chilas', 'Hunza'],
    'Islamabad Capital Territory': ['Islamabad'],
    'Azad Jammu & Kashmir': ['Muzaffarabad', 'Mirpur', 'Kotli', 'Rawalakot'],
};

export const educationalBoards = [
  "Federal Board of Intermediate and Secondary Education",
  // Punjab
  "BISE, Bahawalpur",
  "BISE, Dera Ghazi Khan",
  "BISE, Faisalabad",
  "BISE, Gujranwala",
  "BISE, Lahore",
  "BISE, Multan",
  "BISE, Rawalpindi",
  "BISE, Sahiwal",
  "BISE, Sargodha",
  // Sindh
  "BIEK, Karachi",
  "BISE, Hyderabad",
  "BISE, Larkana",
  "BISE, Mirpur Khas",
  "BISE, Sukkur",
  "BISE, Shaheed Benazirabad",
  // Khyber Pakhtunkhwa
  "BISE, Abbottabad",
  "BISE, Bannu",
  "BISE, Dera Ismail Khan",
  "BISE, Kohat",
  "BISE, Malakand",
  "BISE, Mardan",
  "BISE, Peshawar",
  "BISE, Swat",
  // Balochistan
  "BISE, Quetta",
  "BISE, Khuzdar",
  "BISE, Turbat",
  "BISE, Loralai",
  // AJK
  "AJK BISE, Mirpur"
];
