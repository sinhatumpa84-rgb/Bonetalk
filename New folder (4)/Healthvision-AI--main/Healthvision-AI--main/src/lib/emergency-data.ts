export type Helpline = { label: string; number: string };
export type Region = { name: string; lines: Helpline[] };

export const NATIONAL: Helpline[] = [
  { label: "All-in-One Emergency", number: "112" },
  { label: "Police", number: "100" },
  { label: "Fire", number: "101" },
  { label: "Ambulance", number: "102" },
  { label: "Medical Emergency (108)", number: "108" },
  { label: "Women Helpline", number: "1091" },
  { label: "Child Helpline", number: "1098" },
  { label: "Senior Citizen", number: "14567" },
  { label: "Disaster Management (NDMA)", number: "1078" },
  { label: "Blood Bank", number: "104" },
  { label: "Mental Health (KIRAN)", number: "18005990019" },
  { label: "COVID Helpline", number: "1075" },
  { label: "Road Accident", number: "1073" },
  { label: "Railway Protection", number: "182" },
];

export const STATES: Region[] = [
  { name: "Andhra Pradesh", lines: [
    { label: "State Emergency", number: "112" },
    { label: "Ambulance", number: "108" },
    { label: "Women Helpline", number: "181" },
    { label: "Disha (Women SOS)", number: "1800-425-0033" },
  ]},
  { name: "Arunachal Pradesh", lines: [
    { label: "State Emergency", number: "112" },
    { label: "Ambulance", number: "102" },
    { label: "Women Helpline", number: "1091" },
  ]},
  { name: "Assam", lines: [
    { label: "State Emergency", number: "112" },
    { label: "Ambulance", number: "108" },
    { label: "Women Helpline", number: "181" },
    { label: "Mental Health (SCARF)", number: "1800-599-0019" },
  ]},
  { name: "Bihar", lines: [
    { label: "Dial 112", number: "112" },
    { label: "Ambulance", number: "102" },
    { label: "Women Helpline", number: "181" },
  ]},
  { name: "Chhattisgarh", lines: [
    { label: "Dial 112", number: "112" },
    { label: "Ambulance", number: "108" },
    { label: "Women Helpline", number: "1091" },
  ]},
  { name: "Delhi (NCT)", lines: [
    { label: "All Emergencies", number: "112" },
    { label: "Delhi Police WhatsApp", number: "9999999999" },
    { label: "CATS Ambulance", number: "102" },
    { label: "Women Helpline", number: "1091" },
    { label: "Anti-Stalking", number: "1096" },
  ]},
  { name: "Goa", lines: [
    { label: "Dial 112", number: "112" },
    { label: "Ambulance", number: "108" },
    { label: "Tourist Helpline", number: "1364" },
  ]},
  { name: "Gujarat", lines: [
    { label: "Dial 112", number: "112" },
    { label: "108 EMRI Ambulance", number: "108" },
    { label: "Abhayam Women Helpline", number: "181" },
  ]},
  { name: "Haryana", lines: [
    { label: "Dial 112", number: "112" },
    { label: "Ambulance", number: "108" },
    { label: "Women Helpline", number: "1091" },
  ]},
  { name: "Himachal Pradesh", lines: [
    { label: "Dial 112", number: "112" },
    { label: "Ambulance", number: "108" },
    { label: "Gudiya Helpline (Women)", number: "1515" },
  ]},
  { name: "Jharkhand", lines: [
    { label: "Dial 112", number: "112" },
    { label: "Ambulance", number: "108" },
    { label: "Women Helpline", number: "181" },
  ]},
  { name: "Karnataka", lines: [
    { label: "Dial 112", number: "112" },
    { label: "Arogya Kavacha Ambulance", number: "108" },
    { label: "Vanitha Sahayavani (Women)", number: "1091" },
    { label: "BBMP Control Room", number: "1533" },
  ]},
  { name: "Kerala", lines: [
    { label: "Dial 112", number: "112" },
    { label: "Ambulance", number: "108" },
    { label: "Mithra 181 (Women)", number: "181" },
    { label: "Disaster Management", number: "1077" },
  ]},
  { name: "Madhya Pradesh", lines: [
    { label: "Dial 112", number: "112" },
    { label: "Ambulance (Janani Express)", number: "108" },
    { label: "Women Helpline", number: "1090" },
  ]},
  { name: "Maharashtra", lines: [
    { label: "Dial 112", number: "112" },
    { label: "MEMS Ambulance", number: "108" },
    { label: "Women Helpline", number: "103" },
    { label: "Mumbai Police", number: "100" },
    { label: "BMC Disaster", number: "1916" },
  ]},
  { name: "Manipur", lines: [
    { label: "Dial 112", number: "112" },
    { label: "Ambulance", number: "102" },
  ]},
  { name: "Meghalaya", lines: [
    { label: "Dial 112", number: "112" },
    { label: "Ambulance", number: "102" },
  ]},
  { name: "Mizoram", lines: [
    { label: "Dial 112", number: "112" },
    { label: "Ambulance", number: "102" },
  ]},
  { name: "Nagaland", lines: [
    { label: "Dial 112", number: "112" },
    { label: "Ambulance", number: "102" },
  ]},
  { name: "Odisha", lines: [
    { label: "Dial 112", number: "112" },
    { label: "Ambulance", number: "108" },
    { label: "Women Helpline", number: "181" },
  ]},
  { name: "Punjab", lines: [
    { label: "Dial 112", number: "112" },
    { label: "Ambulance", number: "108" },
    { label: "Women Helpline", number: "1091" },
  ]},
  { name: "Rajasthan", lines: [
    { label: "Dial 112", number: "112" },
    { label: "108 Ambulance", number: "108" },
    { label: "Women Helpline", number: "1090" },
  ]},
  { name: "Sikkim", lines: [
    { label: "Dial 112", number: "112" },
    { label: "Ambulance", number: "102" },
  ]},
  { name: "Tamil Nadu", lines: [
    { label: "Dial 112", number: "112" },
    { label: "108 GVK EMRI", number: "108" },
    { label: "Women Helpline", number: "181" },
    { label: "Chennai Corporation", number: "1913" },
  ]},
  { name: "Telangana", lines: [
    { label: "Dial 112", number: "112" },
    { label: "108 Ambulance", number: "108" },
    { label: "She Teams (Women)", number: "100" },
    { label: "Hawk Eye App Helpline", number: "9491011111" },
  ]},
  { name: "Tripura", lines: [
    { label: "Dial 112", number: "112" },
    { label: "Ambulance", number: "102" },
  ]},
  { name: "Uttar Pradesh", lines: [
    { label: "UP-112", number: "112" },
    { label: "Ambulance", number: "108" },
    { label: "Women Powerline 1090", number: "1090" },
  ]},
  { name: "Uttarakhand", lines: [
    { label: "Dial 112", number: "112" },
    { label: "Ambulance", number: "108" },
    { label: "Disaster Helpline", number: "1070" },
  ]},
  { name: "West Bengal", lines: [
    { label: "Dial 112", number: "112" },
    { label: "Ambulance", number: "102" },
    { label: "Kolkata Police", number: "100" },
    { label: "Women Helpline", number: "1091" },
  ]},
  { name: "Jammu & Kashmir (UT)", lines: [
    { label: "Dial 112", number: "112" },
    { label: "Ambulance", number: "102" },
  ]},
  { name: "Ladakh (UT)", lines: [
    { label: "Dial 112", number: "112" },
    { label: "Ambulance", number: "102" },
  ]},
  { name: "Chandigarh (UT)", lines: [
    { label: "Dial 112", number: "112" },
    { label: "Ambulance", number: "108" },
  ]},
  { name: "Puducherry (UT)", lines: [
    { label: "Dial 112", number: "112" },
    { label: "Ambulance", number: "108" },
  ]},
  { name: "Andaman & Nicobar (UT)", lines: [
    { label: "Dial 112", number: "112" },
    { label: "Ambulance", number: "102" },
  ]},
  { name: "Dadra & Nagar Haveli and Daman & Diu (UT)", lines: [
    { label: "Dial 112", number: "112" },
    { label: "Ambulance", number: "108" },
  ]},
  { name: "Lakshadweep (UT)", lines: [
    { label: "Dial 112", number: "112" },
    { label: "Ambulance", number: "102" },
  ]},
];
