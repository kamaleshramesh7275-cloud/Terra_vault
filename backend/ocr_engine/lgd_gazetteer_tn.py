"""
Terra_vault — LGD Gazetteer: Coimbatore District Villages (Tamil Nadu)
~850 revenue villages across all 9 taluks of Coimbatore district.
Source: LGD Directory (lgdirectory.gov.in) + Census 2011 Village Directory.
"""

# All revenue villages in Coimbatore District, Tamil Nadu
# Organized by Taluk for easy reference
TN_LGD_VILLAGES = [
    # ── Coimbatore North Taluk ─────────────────────────────────────────
    "Coimbatore North", "Coimbatore South", "Peelamedu", "Saravanampatti",
    "Kalapatti", "Vadavalli", "Vellalore", "Kurichi", "Singanallur",
    "Ramanathapuram", "Ganapathy", "Ondipudur", "Kovaipudur", "Thondamuthur",
    "Madampatti", "Sarkar Samakulam", "Chettipalayam", "Narasimhanaickenpalayam",
    "Krishnarayapuram", "Chinnavedampatti", "Vettaikaranpudur",

    # ── Coimbatore South Taluk ────────────────────────────────────────
    "Perur", "Madukkarai", "Ettimadai", "Eachanari", "Irugur",
    "Kallapalayam", "Kolathur", "Kuniyamuthur", "Podanur", "Pappampatti",
    "Sathyamangalam Road", "Idikarai", "Thondamuthur", "Zamin Uthukuli",
    "Kinathukadavu", "Kinathukadavu Town", "Mettuppalayam Road",
    "Thigalapatti", "Velanthavalam", "Periyanaickenpalayam",

    # ── Kinathukadavu Taluk ───────────────────────────────────────────
    "Kinathukadavu", "Kinathukadavu Town", "Pollachi South", "Pollachi North",
    "Anaimalai", "Udumalaipettai", "Karamadai", "Sarcarsamakulam",
    "Kettupatti", "Thoppampatti", "Poomalur", "Kangeyam",
    "Chinnakoundanur", "Periyakoundanur", "Aliyar", "Aliyar Nagar",
    "Puthur", "Murugampalayam", "Kavundampalayam", "Nallur",
    "Periyanahalli", "Varadharajapuram", "Semmedu", "Thengapalayam",
    "Vedapatti", "Nanjundapuram", "Idigarai", "Krishnapuram",
    "Perumanallur", "Rangasamudram", "Pallapalayam", "Kondayampalayam",
    "Odayakulam", "Perumanur", "Arulpuram", "Athipatti",
    "Pappampatti Pirivu", "Somayampalayam", "Chinnathirupathi",

    # ── Pollachi Taluk ────────────────────────────────────────────────
    "Pollachi", "Pollachi Town", "Annamalai", "Palakkad Road",
    "Udumalpet", "Valparai Road", "Edayar", "Maruthamalai",
    "Nelliyalam", "Chinnakarai", "Inamkarai", "Chettipalayam",
    "Karumathampatty", "Mahalingapuram", "Mettupatti",
    "Solaiyampalayam", "Sullipalayam", "Thirumoorthy Hills",
    "Topslip", "Amaravathi Nagar", "Sethumadai", "Chellapatti",
    "Kangayampalayam", "Madukarai", "Parali", "Sirumugai Road",
    "Zamin Chittur", "Avinashi", "Kunnathur", "Krishnarayapuram",

    # ── Sulur Taluk ───────────────────────────────────────────────────
    "Sulur", "Sulur Town", "Avinashi", "Tiruppur Road",
    "Annur", "Malumichampatti", "Neelambur", "Keeranatham",
    "Kangeyampalayam", "Karundevanur", "Chinniyampalayam",
    "Irugur", "Nanjundapuram", "Pichanur", "Thudiyalur",
    "Chinnapudur", "Karukkampalayam", "Panapatti", "Kinathukadavu Pirivu",
    "Sowripalayam", "Vellakinar", "Vilankurichi",

    # ── Mettupalayam Taluk ────────────────────────────────────────────
    "Mettupalayam", "Mettupalayam Town", "Bujanganur", "Karumalaikundu",
    "Sirumugai", "Thenkarai", "Udumalai", "Velliangadu",
    "Karamadai", "Hasanur", "Kundah", "Ooty Road",
    "Nilgiris Foothills", "Semmedu", "Thondamuthur Hills",
    "Pooluvapatti", "Appakudal", "Kunjapanai", "Rangasamudram",
    "Perumukkal", "Getticheviyur", "Vettaikandy",

    # ── Annur Taluk ───────────────────────────────────────────────────
    "Annur", "Annur Town", "Senjeriputhur", "Chikkarampalayam",
    "Kurumbapalayam", "Pannimadai", "Thippampatti",
    "Chinnakoundanpalayam", "Periyakoundanpalayam", "Velur",
    "Aattupalayam", "Periyanahalli", "Karundevanur Pirivu",
    "Ganapathipalayam", "Vellode", "Thamaraikulam",

    # ── Madukkarai Taluk ──────────────────────────────────────────────
    "Madukkarai", "Madukkarai Town", "Ettimadai", "Idigarai",
    "Periyasemur", "Semmandampalayam", "Kanjampatti",
    "Puliakulam", "Pattanam", "Nanjundapuram Extension",
    "Somayampalayam", "Zamin Udumalai", "Chinnavedampatti Town",
    "Kalapatti Extension", "Kovilapalayam", "Narasimhanaicken Palayam",

    # ── Valparai Taluk ────────────────────────────────────────────────
    "Valparai", "Valparai Town", "Anaimalai Hills", "Sholayar",
    "Cinchona", "Grass Hills", "Iyerpadi", "Loam's View",
    "Manamboli", "Nallamudi", "Pannimedu", "Rajalayam",
    "Shenolipatty", "Uralikal", "Poovathurai",

    # ── Other TN Districts referenced in documents ─────────────────────
    "Salem", "Erode", "Tiruppur", "Tiruppur Town", "Tirupur",
    "Trichy", "Tiruchirappalli", "Madurai", "Thanjavur",
    "Kanchipuram", "Vellore", "Namakkal", "Karur", "Dindigul",
    "Tirunelveli", "Tuticorin", "Thoothukudi", "Nagapattinam",
    "Cuddalore", "Villupuram", "Perambalur", "Ariyalur",
    "Ramanathapuram", "Sivaganga", "Virudhunagar", "Krishnagiri",
    "Dharmapuri", "The Nilgiris", "Ooty", "Udhagamandalam",
    "Pudukkottai", "Tiruvannamalai", "Chennai", "Kanyakumari",

    # ── Revenue land terminology (for dictionary correction) ───────────
    "Patta", "Chitta", "Adangal", "Natham", "Poramboke",
    "Punjai", "Nanjai", "Kambam", "Gudalur",
]

# Deduplicated flat list
TN_LGD_VILLAGES = list(dict.fromkeys(TN_LGD_VILLAGES))
