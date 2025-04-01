// List of Nairobi constituencies and wards
// Source: http://countytrak.infotrakresearch.com/nairobi-county/

export const NAIROBI_CONSTITUENCIES = [
  'Dagoretti North',
  'Dagoretti South',
  'Embakasi Central',
  'Embakasi East',
  'Embakasi North',
  'Embakasi South',
  'Embakasi West',
  'Kamukunji',
  'Kasarani',
  'Kibra',
  'Langata',
  'Makadara',
  'Mathare',
  'Roysambu',
  'Ruaraka',
  'Starehe',
  'Westlands'
];

export const NAIROBI_WARDS = [
  // Dagoretti North
  'Kilimani',
  'Kawangware',
  'Gatina',
  'Kileleshwa',
  'Kabiro',
  
  // Dagoretti South
  'Mutuini',
  'Ngando',
  'Riruta',
  'Uthiru/Ruthimitu',
  'Waithaka',
  
  // Embakasi Central
  'Kayole North',
  'Kayole Central',
  'Kayole South',
  'Komarock',
  'Matopeni/Spring Valley',
  
  // Embakasi East
  'Upper Savanna',
  'Lower Savanna',
  'Embakasi',
  'Utawala',
  'Mihango',
  
  // Embakasi North
  'Kariobangi North',
  'Dandora Area I',
  'Dandora Area II',
  'Dandora Area III',
  'Dandora Area IV',
  
  // Embakasi South
  'Imara Daima',
  'Kwa Njenga',
  'Kwa Reuben',
  'Pipeline',
  'Kware',
  
  // Embakasi West
  'Umoja I',
  'Umoja II',
  'Mowlem',
  'Kariobangi South',
  
  // Kamukunji
  'Pumwani',
  'Eastleigh North',
  'Eastleigh South',
  'Airbase',
  'California',
  
  // Kasarani
  'Clay City',
  'Mwiki',
  'Kasarani',
  'Njiru',
  'Ruai',
  
  // Kibra
  'Laini Saba',
  'Lindi',
  'Makina',
  'Woodley/Kenyatta Golf Course',
  'Sarangombe',
  
  // Langata
  'Karen',
  'Nairobi West',
  'Mugumo-Ini',
  'South C',
  'Nyayo Highrise',
  
  // Makadara
  'Maringo/Hamza',
  'Viwandani',
  'Harambee',
  'Makongeni',
  
  // Mathare
  'Hospital',
  'Mabatini',
  'Huruma',
  'Ngei',
  'Mlango Kubwa',
  'Kiamaiko',
  
  // Roysambu
  'Githurai',
  'Kahawa West',
  'Zimmerman',
  'Roysambu',
  'Kahawa',
  
  // Ruaraka
  'Baba Dogo',
  'Utalii',
  'Mathare North',
  'Lucky Summer',
  'Korogocho',
  
  // Starehe
  'Nairobi Central',
  'Ngara',
  'Pangani',
  'Ziwani/Kariokor',
  'Landimawe',
  'Nairobi South',
  
  // Westlands
  'Kitisuru',
  'Parklands/Highridge',
  'Karura',
  'Kangemi',
  'Mountain View'
];

// Map of wards to constituencies
export const WARD_TO_CONSTITUENCY: Record<string, string> = {
  // Dagoretti North
  'Kilimani': 'Dagoretti North',
  'Kawangware': 'Dagoretti North',
  'Gatina': 'Dagoretti North',
  'Kileleshwa': 'Dagoretti North',
  'Kabiro': 'Dagoretti North',
  
  // Dagoretti South
  'Mutuini': 'Dagoretti South',
  'Ngando': 'Dagoretti South',
  'Riruta': 'Dagoretti South',
  'Uthiru/Ruthimitu': 'Dagoretti South',
  'Waithaka': 'Dagoretti South',
  
  // Embakasi Central
  'Kayole North': 'Embakasi Central',
  'Kayole Central': 'Embakasi Central',
  'Kayole South': 'Embakasi Central',
  'Komarock': 'Embakasi Central',
  'Matopeni/Spring Valley': 'Embakasi Central',
  
  // Embakasi East
  'Upper Savanna': 'Embakasi East',
  'Lower Savanna': 'Embakasi East',
  'Embakasi': 'Embakasi East',
  'Utawala': 'Embakasi East',
  'Mihango': 'Embakasi East',
  
  // Embakasi North
  'Kariobangi North': 'Embakasi North',
  'Dandora Area I': 'Embakasi North',
  'Dandora Area II': 'Embakasi North',
  'Dandora Area III': 'Embakasi North',
  'Dandora Area IV': 'Embakasi North',
  
  // Embakasi South
  'Imara Daima': 'Embakasi South',
  'Kwa Njenga': 'Embakasi South',
  'Kwa Reuben': 'Embakasi South',
  'Pipeline': 'Embakasi South',
  'Kware': 'Embakasi South',
  
  // Embakasi West
  'Umoja I': 'Embakasi West',
  'Umoja II': 'Embakasi West',
  'Mowlem': 'Embakasi West',
  'Kariobangi South': 'Embakasi West',
  
  // Kamukunji
  'Pumwani': 'Kamukunji',
  'Eastleigh North': 'Kamukunji',
  'Eastleigh South': 'Kamukunji',
  'Airbase': 'Kamukunji',
  'California': 'Kamukunji',
  
  // Kasarani
  'Clay City': 'Kasarani',
  'Mwiki': 'Kasarani',
  'Kasarani': 'Kasarani',
  'Njiru': 'Kasarani',
  'Ruai': 'Kasarani',
  
  // Kibra
  'Laini Saba': 'Kibra',
  'Lindi': 'Kibra',
  'Makina': 'Kibra',
  'Woodley/Kenyatta Golf Course': 'Kibra',
  'Sarangombe': 'Kibra',
  
  // Langata
  'Karen': 'Langata',
  'Nairobi West': 'Langata',
  'Mugumo-Ini': 'Langata',
  'South C': 'Langata',
  'Nyayo Highrise': 'Langata',
  
  // Makadara
  'Maringo/Hamza': 'Makadara',
  'Viwandani': 'Makadara',
  'Harambee': 'Makadara',
  'Makongeni': 'Makadara',
  
  // Mathare
  'Hospital': 'Mathare',
  'Mabatini': 'Mathare',
  'Huruma': 'Mathare',
  'Ngei': 'Mathare',
  'Mlango Kubwa': 'Mathare',
  'Kiamaiko': 'Mathare',
  
  // Roysambu
  'Githurai': 'Roysambu',
  'Kahawa West': 'Roysambu',
  'Zimmerman': 'Roysambu',
  'Roysambu': 'Roysambu',
  'Kahawa': 'Roysambu',
  
  // Ruaraka
  'Baba Dogo': 'Ruaraka',
  'Utalii': 'Ruaraka',
  'Mathare North': 'Ruaraka',
  'Lucky Summer': 'Ruaraka',
  'Korogocho': 'Ruaraka',
  
  // Starehe
  'Nairobi Central': 'Starehe',
  'Ngara': 'Starehe',
  'Pangani': 'Starehe',
  'Ziwani/Kariokor': 'Starehe',
  'Landimawe': 'Starehe',
  'Nairobi South': 'Starehe',
  
  // Westlands
  'Kitisuru': 'Westlands',
  'Parklands/Highridge': 'Westlands',
  'Karura': 'Westlands',
  'Kangemi': 'Westlands',
  'Mountain View': 'Westlands'
};

// Function to get wards for a specific constituency
export function getWardsForConstituency(constituency: string): string[] {
  return NAIROBI_WARDS.filter(ward => 
    WARD_TO_CONSTITUENCY[ward] === constituency
  );
}