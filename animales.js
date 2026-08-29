/*
==================================================
XTREME PREDICTOR 2.0
ANIMALES POR LOTERÍA
==================================================
*/


const animalesGuacharo = [

  { numero:"0", animal:"DELFÍN", emoji:"🐬" },
  { numero:"00", animal:"BALLENA", emoji:"🐋" },

  { numero:"01", animal:"CARNERO", emoji:"🐏" },
  { numero:"02", animal:"TORO", emoji:"🐂" },
  { numero:"03", animal:"CIEMPIÉS", emoji:"🐛" },
  { numero:"04", animal:"ALACRÁN", emoji:"🦂" },
  { numero:"05", animal:"LEÓN", emoji:"🦁" },
  { numero:"06", animal:"RANA", emoji:"🐸" },
  { numero:"07", animal:"PERICO", emoji:"🦜" },
  { numero:"08", animal:"RATÓN", emoji:"🐭" },
  { numero:"09", animal:"ÁGUILA", emoji:"🦅" },

  { numero:"10", animal:"TIGRE", emoji:"🐯" },
  { numero:"11", animal:"GATO", emoji:"🐱" },
  { numero:"12", animal:"CABALLO", emoji:"🐴" },
  { numero:"13", animal:"MONO", emoji:"🐒" },
  { numero:"14", animal:"PALOMA", emoji:"🕊️" },
  { numero:"15", animal:"ZORRO", emoji:"🦊" },
  { numero:"16", animal:"OSO", emoji:"🐻" },
  { numero:"17", animal:"PAVO", emoji:"🦃" },
  { numero:"18", animal:"BURRO", emoji:"🫏" },
  { numero:"19", animal:"CHIVO", emoji:"🐐" },

  { numero:"20", animal:"COCHINO", emoji:"🐷" },
  { numero:"21", animal:"GALLO", emoji:"🐓" },
  { numero:"22", animal:"CAMELLO", emoji:"🐫" },
  { numero:"23", animal:"CEBRA", emoji:"🦓" },
  { numero:"24", animal:"IGUANA", emoji:"🦎" },
  { numero:"25", animal:"GALLINA", emoji:"🐔" },
  { numero:"26", animal:"VACA", emoji:"🐄" },
  { numero:"27", animal:"PERRO", emoji:"🐶" },
  { numero:"28", animal:"ZAMURO", emoji:"🦅" },
  { numero:"29", animal:"ELEFANTE", emoji:"🐘" },

  { numero:"30", animal:"CAIMÁN", emoji:"🐊" },
  { numero:"31", animal:"LAPA", emoji:"🐹" },
  { numero:"32", animal:"ARDILLA", emoji:"🐿️" },
  { numero:"33", animal:"PESCADO", emoji:"🐟" },
  { numero:"34", animal:"VENADO", emoji:"🦌" },
  { numero:"35", animal:"JIRAFA", emoji:"🦒" },
  { numero:"36", animal:"CULEBRA", emoji:"🐍" },
  { numero:"37", animal:"TORTUGA", emoji:"🐢" },
  { numero:"38", animal:"BÚFALO", emoji:"🐃" },
  { numero:"39", animal:"LECHUZA", emoji:"🦉" },

  { numero:"40", animal:"AVISPA", emoji:"🐝" },
  { numero:"41", animal:"CANGURO", emoji:"🦘" },
  { numero:"42", animal:"TUCÁN", emoji:"🦜" },
  { numero:"43", animal:"MARIPOSA", emoji:"🦋" },
  { numero:"44", animal:"CHIGÜIRE", emoji:"🦫" },
  { numero:"45", animal:"GARZA", emoji:"🪿" },
  { numero:"46", animal:"PUMA", emoji:"🐆" },
  { numero:"47", animal:"PAVO REAL", emoji:"🦚" },
  { numero:"48", animal:"PUERCOESPÍN", emoji:"🦔" },
  { numero:"49", animal:"PEREZA", emoji:"🦥" },

  { numero:"50", animal:"CANARIO", emoji:"🐤" },
  { numero:"51", animal:"PELÍCANO", emoji:"🦩" },
  { numero:"52", animal:"PULPO", emoji:"🐙" },
  { numero:"53", animal:"CARACOL", emoji:"🐌" },
  { numero:"54", animal:"GRILLO", emoji:"🦗" },
  { numero:"55", animal:"OSO HORMIGUERO", emoji:"🐜" },
  { numero:"56", animal:"TIBURÓN", emoji:"🦈" },
  { numero:"57", animal:"PATO", emoji:"🦆" },
  { numero:"58", animal:"HORMIGA", emoji:"🐜" },
  { numero:"59", animal:"PANTERA", emoji:"🐈‍⬛" },

  { numero:"60", animal:"CAMALEÓN", emoji:"🦎" },
  { numero:"61", animal:"PANDA", emoji:"🐼" },
  { numero:"62", animal:"CACHICAMO", emoji:"🦔" },
  { numero:"63", animal:"CANGREJO", emoji:"🦀" },
  { numero:"64", animal:"GAVILÁN", emoji:"🦅" },
  { numero:"65", animal:"ARAÑA", emoji:"🕷️" },
  { numero:"66", animal:"LOBO", emoji:"🐺" },
  { numero:"67", animal:"AVESTRUZ", emoji:"🪶" },
  { numero:"68", animal:"JAGUAR", emoji:"🐆" },
  { numero:"69", animal:"CONEJO", emoji:"🐰" },

  { numero:"70", animal:"BISONTE", emoji:"🦬" },
  { numero:"71", animal:"GUACAMAYA", emoji:"🦜" },
  { numero:"72", animal:"GORILA", emoji:"🦍" },
  { numero:"73", animal:"HIPOPÓTAMO", emoji:"🦛" },
  { numero:"74", animal:"TURPIAL", emoji:"🐦" },
  { numero:"75", animal:"GUÁCHARO", emoji:"🦉" }

];


const animalesGranjita = [

  { numero:"00", animal:"BALLENA", emoji:"🐋" },
  { numero:"01", animal:"CARNERO", emoji:"🐏" },
  { numero:"02", animal:"TORO", emoji:"🐂" },
  { numero:"03", animal:"CIEMPIÉS", emoji:"🐛" },
  { numero:"04", animal:"ALACRÁN", emoji:"🦂" },
  { numero:"05", animal:"LEÓN", emoji:"🦁" },
  { numero:"06", animal:"RANA", emoji:"🐸" },
  { numero:"07", animal:"PERICO", emoji:"🦜" },
  { numero:"08", animal:"RATÓN", emoji:"🐭" },
  { numero:"09", animal:"ÁGUILA", emoji:"🦅" },

  { numero:"10", animal:"TIGRE", emoji:"🐯" },
  { numero:"11", animal:"GATO", emoji:"🐱" },
  { numero:"12", animal:"CABALLO", emoji:"🐴" },
  { numero:"13", animal:"MONO", emoji:"🐒" },
  { numero:"14", animal:"PALOMA", emoji:"🕊️" },
  { numero:"15", animal:"ZORRO", emoji:"🦊" },
  { numero:"16", animal:"OSO", emoji:"🐻" },
  { numero:"17", animal:"PAVO", emoji:"🦃" },
  { numero:"18", animal:"BURRO", emoji:"🫏" },
  { numero:"19", animal:"CHIVO", emoji:"🐐" },

  { numero:"20", animal:"COCHINO", emoji:"🐷" },
  { numero:"21", animal:"GALLO", emoji:"🐓" },
  { numero:"22", animal:"CAMELLO", emoji:"🐫" },
  { numero:"23", animal:"CEBRA", emoji:"🦓" },
  { numero:"24", animal:"IGUANA", emoji:"🦎" },
  { numero:"25", animal:"GALLINA", emoji:"🐔" },
  { numero:"26", animal:"VACA", emoji:"🐄" },
  { numero:"27", animal:"PERRO", emoji:"🐶" },
  { numero:"28", animal:"ZAMURO", emoji:"🦅" },
  { numero:"29", animal:"ELEFANTE", emoji:"🐘" },

  { numero:"30", animal:"CAIMÁN", emoji:"🐊" },
  { numero:"31", animal:"LAPA", emoji:"🐹" },
  { numero:"32", animal:"ARDILLA", emoji:"🐿️" },
  { numero:"33", animal:"PESCADO", emoji:"🐟" },
  { numero:"34", animal:"VENADO", emoji:"🦌" },
  { numero:"35", animal:"JIRAFA", emoji:"🦒" },
  { numero:"36", animal:"CULEBRA", emoji:"🐍" },
  { numero:"37", animal:"TORTUGA", emoji:"🐢" }

];


/*
==================================================
VARIABLE GLOBAL
==================================================
*/

let animales = animalesGuacharo;
