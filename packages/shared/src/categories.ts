export const CATEGORIES = [
  { id: 'activiteitenbegeleiding', nl: 'Activiteitenbegeleiding', en: 'Activity guidance', color: '#6DC82A' },
  { id: 'maatje_buddy', nl: 'Maatje / buddy / gezelschap', en: 'Buddy / companion', color: '#E8197D' },
  { id: 'gastvrijheid_horeca', nl: 'Gastvrijheid & horeca', en: 'Hospitality & catering', color: '#F47920' },
  { id: 'begeleiding_coaching', nl: 'Begeleiding & coaching', en: 'Guidance & coaching', color: '#7B4BA0' },
  { id: 'klussen_buiten_tuin', nl: 'Klussen buiten & tuin', en: 'Outdoor & garden jobs', color: '#6DC82A' },
  { id: 'creativiteit_muziek', nl: 'Creativiteit & muziek', en: 'Creativity & music', color: '#E8197D' },
  { id: 'taal_lezen', nl: 'Taal & lezen', en: 'Language & reading', color: '#4DC8F0' },
  { id: 'bestuur_organisatie', nl: 'Bestuur & organisatie', en: 'Governance & organisation', color: '#2B3BA8' },
  { id: 'projectcoordinatie', nl: 'Projectcoördinatie', en: 'Project coordination', color: '#7B4BA0' },
  { id: 'koken_maaltijden', nl: 'Koken & maaltijden', en: 'Cooking & meals', color: '#F47920' },
  { id: 'vervoer_transport', nl: 'Vervoer & transport', en: 'Transport', color: '#4DC8F0' },
  { id: 'hulp_bij_armoede', nl: 'Hulp bij armoede', en: 'Poverty assistance', color: '#E8197D' },
  { id: 'administratie_receptie', nl: 'Administratie & receptie', en: 'Administration & reception', color: '#2B3BA8' },
  { id: 'techniek_reparatie', nl: 'Techniek & reparatie', en: 'Technology & repair', color: '#6DC82A' },
  { id: 'klussen_binnen', nl: 'Klussen binnen', en: 'Indoor jobs', color: '#F47920' },
  { id: 'marketing_communicatie', nl: 'Marketing & communicatie', en: 'Marketing & communications', color: '#4DC8F0' },
  { id: 'financien_fondsenwerving', nl: 'Financiën & fondsenwerving', en: 'Finance & fundraising', color: '#7B4BA0' },
  { id: 'winkel', nl: 'In een winkel', en: 'In a shop', color: '#E8197D' },
] as const;

export type CategoryId = typeof CATEGORIES[number]['id'];

export const KERNEN = [
  'Abbenes',
  'Badhoevedorp',
  'Beinsdorp',
  'Burgerveen',
  'Cruquius',
  'De Kaag',
  'De Kwakel',
  'Hoofddorp',
  'Kudelstaart',
  'Lijnden',
  'Lisserbroek',
  'Nazareth',
  'Nieuw-Vennep',
  'Oude Meer',
  'Oudorp',
  'Rijsenhout',
  'Rozenburg',
  'Spaarndam',
  'Vijfhuizen',
  'Zwanenburg',
] as const;

export type Kern = typeof KERNEN[number];
