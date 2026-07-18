// Size chart types and their column definitions
export const SIZE_TYPES = {
  /* ── Clothing ── */
  tops:             { label:'Tops & Upper Body',           cols:['chest_cm','shoulder_cm','sleeve_cm'],                sizes:['XXXS','XXS','XS','S','M','L','XL','XXL','XXXL','4XL','5XL','6XL','7XL','8XL','9XL','10XL','Petite XS','Petite S','Petite M','Petite L','Petite XL','Tall XS','Tall S','Tall M','Tall L','Tall XL','0X','1X','2X','3X','4X','5X','6X','7X','8X'] },
  bottoms:          { label:'Bottoms & Skirts',            cols:['waist_cm','hip_cm','inseam_cm'],                     sizes:['XXXS','XXS','XS','S','M','L','XL','XXL','XXXL','4XL','5XL','6XL','7XL','8XL','9XL','10XL','0X','1X','2X','3X','4X','5X','6X','7X','8X'] },
  womens_numeric:   { label:"Women's Numeric (US/EU)",     cols:['chest_cm','waist_cm','hip_cm'],                      sizes:['000','00','0','2','4','6','8','10','12','14','16','18','20','22','24','26','28','30','32','34','36'] },
  bottoms_numeric:  { label:"Men's Waist (Numeric)",       cols:['waist_cm','hip_cm','inseam_cm'],                     sizes:['24','25','26','27','28','29','30','31','32','33','34','35','36','38','40','42','44','46','48','50','52','54','56','58','60'] },
  jeans:            { label:'Jeans (Waist × Length)', cols:['waist_cm','inseam_cm'],                              sizes:['28×28','28×30','28×32','28×34','30×30','30×32','30×34','30×36','32×30','32×32','32×34','32×36','34×30','34×32','34×34','34×36','36×30','36×32','36×34','36×36','38×30','38×32','38×34','40×30','40×32','42×30','42×32'] },
  dresses:          { label:'Dresses & Full Body',         cols:['chest_cm','waist_cm','hip_cm','length_cm'],          sizes:['XXXS','XXS','XS','S','M','L','XL','XXL','XXXL','4XL','5XL','6XL','7XL','8XL','0X','1X','2X','3X','4X','5X','Petite XS','Petite S','Petite M','Petite L','Petite XL','Maternity XS','Maternity S','Maternity M','Maternity L','Maternity XL','Maternity XXL'] },
  swimwear:         { label:'Swimwear',                    cols:['chest_cm','waist_cm','hip_cm'],                      sizes:['XXS','XS','S','M','L','XL','XXL','XXXL','4XL','5XL','0X','1X','2X','3X','4X'] },
  kaftans:          { label:'Kaftans & Abayas',            cols:['chest_cm','waist_cm','hip_cm','length_cm'],          sizes:['XS','S','M','L','XL','XXL','XXXL','4XL','5XL','6XL','Free Size'] },
  activewear:       { label:'Activewear & Sports',         cols:['chest_cm','waist_cm','hip_cm'],                      sizes:['XXS','XS','S','M','L','XL','XXL','XXXL','4XL','5XL','0X','1X','2X','3X','4X'] },
  lingerie:         { label:'Lingerie & Underwear',        cols:['chest_cm','underbust_cm','hip_cm'],                  sizes:['XXS','XS','S','M','L','XL','XXL','XXXL','4XL'] },
  bra:              { label:'Bras (Band × Cup)',       cols:['band_cm','underbust_cm'],                            sizes:['28AA','28A','28B','28C','28D','28DD','30A','30B','30C','30D','30DD','30E','32A','32B','32C','32D','32DD','32E','32F','34A','34B','34C','34D','34DD','34E','34F','34G','36A','36B','36C','36D','36DD','36E','36F','36G','36H','38A','38B','38C','38D','38DD','38E','38F','38G','38H','40B','40C','40D','40DD','40E','40F','40G','40H','42C','42D','42DD','42E','42F','42G','42H','44D','44DD','44E','44F','44G','46D','46DD','46E','46F'] },
  outerwear:        { label:'Outerwear & Coats',           cols:['chest_cm','shoulder_cm','sleeve_cm','length_cm'],    sizes:['XXXS','XXS','XS','S','M','L','XL','XXL','XXXL','4XL','5XL','6XL','0X','1X','2X','3X','4X'] },
  suits:            { label:'Suits & Formal Wear',         cols:['chest_cm','waist_cm','shoulder_cm','sleeve_cm'],     sizes:['34','36','38','40','42','44','46','48','50','52','54','56','58','60'] },
  shirt_collar:     { label:"Men's Shirts (Collar × Sleeve)", cols:['collar_cm','sleeve_cm','chest_cm'],          sizes:['13','13.5','14','14.5','15','15.5','16','16.5','17','17.5','18','18.5','19','19.5','20','20.5','21'] },
  /* ── Footwear ── */
  footwear_eu:      { label:'Footwear — EU',          cols:['foot_length_cm'],                                    sizes:['15','16','17','18','19','20','21','22','23','24','25','26','27','28','29','30','31','32','33','34','35','35.5','36','36.5','37','37.5','38','38.5','39','39.5','40','40.5','41','41.5','42','42.5','43','43.5','44','44.5','45','45.5','46','46.5','47','47.5','48','49','50','51','52','53','54','55'] },
  footwear_us_mens: { label:'Footwear — US (Men)',    cols:['foot_length_cm'],                                    sizes:['1','1.5','2','2.5','3','3.5','4','4.5','5','5.5','6','6.5','7','7.5','8','8.5','9','9.5','10','10.5','11','11.5','12','12.5','13','13.5','14','14.5','15','15.5','16','16.5','17','17.5','18','19','20'] },
  footwear_us:      { label:'Footwear — US (Women)',  cols:['foot_length_cm'],                                    sizes:['3','3.5','4','4.5','5','5.5','6','6.5','7','7.5','8','8.5','9','9.5','10','10.5','11','11.5','12','12.5','13','13.5','14','14.5','15','16','17','18','19','20'] },
  footwear_uk:      { label:'Footwear — UK',          cols:['foot_length_cm'],                                    sizes:['0','0.5','1','1.5','2','2.5','3','3.5','4','4.5','5','5.5','6','6.5','7','7.5','8','8.5','9','9.5','10','10.5','11','11.5','12','12.5','13','13.5','14','14.5','15','16','17','18','19','20'] },
  footwear_cm:      { label:'Footwear — CM',          cols:['foot_length_cm'],                                    sizes:['10','11','12','13','14','15','16','17','18','19','20','20.5','21','21.5','22','22.5','23','23.5','24','24.5','25','25.5','26','26.5','27','27.5','28','28.5','29','29.5','30','30.5','31','31.5','32','32.5','33','34','35'] },
  /* ── Kids ── */
  kids_baby:        { label:'Baby Sizes',                  cols:['height_cm','weight_kg','chest_cm'],                  sizes:['Preemie','Newborn','0-3M','3-6M','6-9M','9-12M','12-18M','18-24M'] },
  kids_by_age:      { label:'Kids (by Age)',               cols:['height_cm','chest_cm','waist_cm'],                   sizes:['2Y','3Y','4Y','5Y','6Y','7Y','8Y','9Y','10Y','11Y','12Y','13Y','14Y','15Y','16Y'] },
  /* ── Jewellery ── */
  ring_size_us:     { label:'Ring Size (US)',              cols:['circumference_mm','diameter_mm'],                    sizes:['1','1.5','2','2.5','3','3.5','4','4.5','5','5.5','6','6.5','7','7.5','8','8.5','9','9.5','10','10.5','11','11.5','12','12.5','13','13.5','14','14.5','15'] },
  ring_size_uk:     { label:'Ring Size (UK)',              cols:['circumference_mm','diameter_mm'],                    sizes:['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'] },
  ring_size_eu:     { label:'Ring Size (EU/Int.)',         cols:['circumference_mm','diameter_mm'],                    sizes:['44','44.5','45','45.5','46','46.5','47','47.5','48','48.5','49','49.5','50','50.5','51','51.5','52','52.5','53','53.5','54','54.5','55','55.5','56','56.5','57','57.5','58','58.5','59','59.5','60','60.5','61','61.5','62','62.5','63','63.5','64','64.5','65','65.5','66','66.5','67','67.5','68'] },
  necklace:         { label:'Necklace Length',             cols:['length_cm'],                                         sizes:['14"','16"','18"','20"','22"','24"','30"','36"'] },
  bracelet:         { label:'Bracelet Size',               cols:['wrist_cm'],                                          sizes:['XS','S','M','L','XL'] },
  /* ── Accessories ── */
  belt:             { label:'Belt Size',                   cols:['length_cm'],                                         sizes:['70','75','80','85','90','95','100','105','110','115','120','125','130','135','140'] },
  hat:              { label:'Hat / Cap Size',              cols:['head_circumference_cm'],                             sizes:['XS','S','M','L','XL','XXL','6','6⅛','6¼','6⅜','6½','6⅝','6¾','6⅞','7','7⅛','7¼','7⅜','7½','7⅝','7¾','7⅞','8'] },
  gloves:           { label:'Glove Size',                  cols:['hand_circumference_cm'],                             sizes:['XS','S','M','L','XL','XXL','6','7','8','9','10','11','12'] },
  watch:            { label:'Watch Case Size',             cols:['case_diameter_mm'],                                  sizes:['28mm','30mm','32mm','34mm','36mm','38mm','40mm','42mm','44mm','46mm','48mm','50mm'] },
  /* ── Bags & Luggage ── */
  bag_size:         { label:'Bag / Clutch Size',           cols:[],                                                    sizes:['XXS','XS','S','M','L','XL'] },
  luggage:          { label:'Luggage Size',                cols:[],                                                    sizes:['Cabin','Carry-On','Small','Medium','Large','Extra Large'] },
  /* ── Special ── */
  one_size:         { label:'One Size / Free Size',        cols:[],                                                    sizes:['One Size','One Size Fits Most','Adjustable','Free Size','Custom','Made To Measure','Bespoke'] },
}

export const SIZE_VALUES = {
  tops: ['XXS','XS','S','M','L','XL','XXL','3XL','4XL','5XL'],
  bottoms: ['24','25','26','27','28','29','30','31','32','33','34','36','38','40','42'],
  dresses: ['XXS','XS','S','M','L','XL','XXL','3XL'],
  footwear_us_m: ['4','4.5','5','5.5','6','6.5','7','7.5','8','8.5','9','9.5','10','10.5','11','11.5','12','12.5','13','13.5','14','14.5','15','16','17','18','19','20'],
  footwear_us_w: ['4','4.5','5','5.5','6','6.5','7','7.5','8','8.5','9','9.5','10','10.5','11','11.5','12','13'],
  footwear_eu: ['35','35.5','36','36.5','37','37.5','38','38.5','39','39.5','40','40.5','41','41.5','42','42.5','43','43.5','44','44.5','45','45.5','46','47','48'],
  footwear_uk: ['3','3.5','4','4.5','5','5.5','6','6.5','7','7.5','8','8.5','9','9.5','10','10.5','11','11.5','12','13','14'],
  kids: ['Newborn','0-3M','3-6M','6-9M','9-12M','12-18M','18-24M','2T','3T','4T','5','6','7','8','10','12','14','16'],
  rings: ['3','3.5','4','4.5','5','5.5','6','6.5','7','7.5','8','8.5','9','9.5','10','10.5','11','11.5','12','13','14'],
  bras: ['28A','28B','30A','30B','30C','32A','32B','32C','32D','34A','34B','34C','34D','34DD','36B','36C','36D','36DD','38C','38D','38DD','40C','40D'],
  swimwear: ['XXS','XS','S','M','L','XL','XXL'],
  gloves: ['XS','S','M','L','XL','XXL']
}
