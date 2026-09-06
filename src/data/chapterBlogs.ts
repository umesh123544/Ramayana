export interface ChapterBlog {
  id: number;
  chapterId: number;
  title: string;
  hindiTitle: string;
  kanda: string;
  location: string;
  readTime: string;
  dateTag: string;
  sacredSloka: {
    sanskrit: string;
    transliteration: string;
    meaning: string;
  };
  summary: string;
  keyStoryBlog: string[];
  antagonistProfile: {
    name: string;
    hindiName: string;
    title: string;
    description: string;
    threatLevel: 'High' | 'Severe' | 'Legendary' | 'Cataclysmic';
  };
  dharmaLesson: string;
  sacredWeapon: string;
}

export const CHAPTER_BLOGS: ChapterBlog[] = [
  {
    id: 1,
    chapterId: 1,
    title: 'The Golden Dawn of Kosala & The Trials of Vishwamitra',
    hindiTitle: 'अयोध्या वैभव एवं विश्वामित्र अनुग्रह',
    kanda: 'Bala Kanda (बालकाण्ड)',
    location: 'Sarayu Riverbanks & Forest Hermitage of Siddhashrama',
    readTime: '3 min read',
    dateTag: 'Treta Yuga • Sacred Chronicle I',
    sacredSloka: {
      sanskrit: 'रामो विग्रहवान् धर्मः साधुः सत्यपराक्रमः। राजा सर्वस्य लोकस्य देवानामिव वासवः॥',
      transliteration: 'Rāmo vigrahavān dharmaḥ sādhuḥ satyaparākramaḥ | Rājā sarvasya lokasya devānāmiva vāsavaḥ ||',
      meaning: 'Rama is the very embodiment of Dharma, righteous and invincible in truth, protector of all creation just as Indra protects the heavens.',
    },
    summary: 'The peaceful capital of Ayodhya shines upon the banks of the sacred Sarayu. Yet darkness brews beyond the frontiers as Sage Vishwamitra arrives seeking the archer prince to protect the holy yajnas from demonic desecration.',
    keyStoryBlog: [
      'In the resplendent city of Ayodhya, justice, truth, and spiritual devotion flourished under the righteous reign of the Ikshvaku dynasty. The temple bells echoed with the chime of morning mantras, and the waters of the Sarayu river shimmered in morning amber.',
      'However, peaceful contemplation was shattered when the venerable Sage Vishwamitra entered the royal court. Fierce Rakshasa warlords Subahu and Maricha had unleashed torrential defilements upon the sacred sacrificial fires of Siddhashrama, extinguishing holy oblations and terrifying the ascetics.',
      'Armed with the celestial Kodanda bow, young Umesh (Rama) entered the primeval groves. Through disciplined breath and unwavering meditation, the sacred arrows were consecrated. When Subahu unleashed fire volleys from the treetops, Umesh countered with the Manavastra, restoring peace to the hermitages and receiving the blessing of ancient astras.',
    ],
    antagonistProfile: {
      name: 'Subahu',
      hindiName: 'सुबाहु',
      title: 'Asura Warlord of the Sacrificial Woods',
      description: 'A fierce commander under Tataka who wields demonic fire orbs and dark sorcery to disrupt holy spiritual rituals.',
      threatLevel: 'High',
    },
    dharmaLesson: 'True strength is never wielded for vain glory, but solely for the protection of the innocent and preservation of cosmic righteousness.',
    sacredWeapon: 'Kodanda Divine Bow & Manavastra',
  },
  {
    id: 2,
    chapterId: 2,
    title: 'The Sacred Renunciation & The Path into Dandakaranya',
    hindiTitle: 'त्याग, वनगमन एवं दण्डकारण्य प्रवेश',
    kanda: 'Ayodhya Kanda (अयोध्याकाण्ड)',
    location: 'Ganga Confluence & Chitrakoot Hermitage',
    readTime: '4 min read',
    dateTag: 'Treta Yuga • Sacred Chronicle II',
    sacredSloka: {
      sanskrit: 'सत्यमेवेश्वरो लोके सत्ये धर्मः सदा श्रितः। सत्यमूलानि सर्वाणि सत्यान्नास्ति परं पदम्॥',
      transliteration: 'Satyameveśvaro loke satye dharmaḥ sadā śritaḥ | Satyamūlāni sarvāṇi satyānnāsti paraṁ padam ||',
      meaning: 'Truth is the supreme Lord of the universe. Dharma ever abides in truth. All creations rest upon truth; there is no state higher than truth.',
    },
    summary: 'Without a whisper of sorrow or grievance, royal silks and diamond crowns are cast aside. Donning coarse bark and ascetic robes, the hero enters the primeval wilderness to honor his father’s vow.',
    keyStoryBlog: [
      'The palace had prepared for coronation, but destiny demanded sacrifice. When Queen Kaikeyi invoked the ancient boons, Umesh bowed his head in serenity. He declared that forest solitude in service of truth was a thousand times sweeter than a kingdom won through moral compromise.',
      'Crossing the holy Ganges with the humble boatman Guha, the trio—Umesh, the devoted companion Purneema (Sita), and the steadfast guardian—ascended the verdant slopes of Chitrakoot. Here, the hermits welcomed the divine presence with sacred Vedic chants.',
      'Yet the deep jungle was teeming with ravenous creatures and primeval predator demons. Umesh stood vigil day and night, bow drawn, protecting the spiritual tranquility of Chitrakoot while learning the subtle secrets of forest medicine and ancient warfare.',
    ],
    antagonistProfile: {
      name: 'Viradha',
      hindiName: 'विराध',
      title: 'The Cursed Forest Colossus',
      description: 'An invulnerable monstrosity roaming the Dandaka borders, seizing hermits and defying steel blades until buried under the earth.',
      threatLevel: 'High',
    },
    dharmaLesson: 'Filial duty and commitment to truth transcend material status. True sovereignty is mastery over one’s desires.',
    sacredWeapon: 'Ascetic Birch Shafts & Agneyastra',
  },
  {
    id: 3,
    chapterId: 3,
    title: 'Hermitage of Panchavati & The Demon War-Bands',
    hindiTitle: 'पञ्चवटी आश्रम एवं खर-दूषण संहार',
    kanda: 'Aranya Kanda (अरण्यकाण्ड)',
    location: 'Godavari Riverbank & Panchavati Groves',
    readTime: '4 min read',
    dateTag: 'Treta Yuga • Sacred Chronicle III',
    sacredSloka: {
      sanskrit: 'न हि धर्मविहीनेन सुखं शक्यमुपासितुम्। धर्मादेव प्रभवति धर्मे सर्वं प्रतिष्ठितम्॥',
      transliteration: 'Na hi dharmavihīnena sukhaṁ śakyamupāsitum | Dharmādeva prabhavati dharme sarvaṁ pratiṣṭhitam ||',
      meaning: 'Happiness can never be attained by one devoid of Dharma. All auspicious prosperity flows solely from Dharma, in which the universe is established.',
    },
    summary: 'Nestled by the murmuring Godavari river among five sacred banyan trees, Panchavati offered blissful serenity—until Surpanakha arrived with venomous lust and summoned the demon legions of Janasthana.',
    keyStoryBlog: [
      'Under the shade of five ancient banyan trees, a thatched hermitage of bamboo and lotus blossoms stood serenely on the banks of the Godavari. Here, Purneema gathered wild blossoms, chanting hymns of dawn.',
      'The tranquility was abruptly shattered when the Rakshasi Surpanakha, sister of King Raone of Lanka, beheld the archer prince. Rebuffed for her insolence and aggressive attempts to harm Purneema, she fled howling into Janasthana, rallying her warlord brothers Khara and Dushana.',
      'Fourteen thousand demonic soldiers converged upon Panchavati with iron clubs and barbed lances. Standing like an immovable mountain between the horde and the hermitage, Umesh released arrows that struck like sunbeams, decimating the demonic army single-handedly.',
    ],
    antagonistProfile: {
      name: 'Khara & Surpanakha',
      hindiName: 'खर एवं शूर्पणखा',
      title: 'Warlords of Janasthana',
      description: 'The ruthless commanders of fourteen thousand Rakshasas, skilled in venomous darts, dark thunder, and psychological illusion.',
      threatLevel: 'Severe',
    },
    dharmaLesson: 'Righteous courage can stand undefeated against countless hosts of malice. The light of truth dispels legions of darkness.',
    sacredWeapon: 'Divyastra of the Sun & Vayu Arrows',
  },
  {
    id: 4,
    chapterId: 4,
    title: 'The Alluring Illusion • The Golden Deer of Maricha',
    hindiTitle: 'स्वर्णमृग माया एवं मारीच पराभव',
    kanda: 'Aranya Kanda (अरण्यकाण्ड)',
    location: 'Misty Bamboo Glades of Dandaka',
    readTime: '3 min read',
    dateTag: 'Treta Yuga • Sacred Chronicle IV',
    sacredSloka: {
      sanskrit: 'यतो धर्मस्ततो जयः। यतो धर्मस्ततः कृष्णः यतो धर्मस्ततो जयः॥',
      transliteration: 'Yato dharmastato jayaḥ | Yato dharmastataḥ kṛṣṇaḥ yato dharmastato jayaḥ ||',
      meaning: 'Where there is Dharma, there is Divine protection; and where there is Dharma, there is inevitable victory.',
    },
    summary: 'A shimmering deer of radiant sapphire hooves and diamond horns gambols near the hermitage. Behind the blinding gold lurks the most dangerous shapeshifter of the Netherworld: Maricha.',
    keyStoryBlog: [
      'Raone, plotting revenge for his fallen armies, enlisted the cunning sorcerer Maricha. Transforming into a magnificent deer glistening like molten gold, Maricha bounded into the sunny clearings of Panchavati.',
      'Enchanted by the creature’s breathtaking beauty, Purneema implored Umesh to catch the gentle deer. Umesh observed the creature closely; its unnatural luminescence and uncanny teleportation whispered of demonic illusion (Maya).',
      'Pursuing the deer through thorny bamboo thickets, Umesh drew his Kodanda bow. When the piercing arrow struck, the deer shrieked in its true demonic voice, calling out into the wind to deceive the guardians at the hut.',
    ],
    antagonistProfile: {
      name: 'Maricha the Illusionist',
      hindiName: 'मायावी मारीच',
      title: 'Master of Asura Shapeshifting',
      description: 'Capable of shifting into any beast or celestial form, his illusions confuse the senses and lure victims away from protection.',
      threatLevel: 'Severe',
    },
    dharmaLesson: 'Beware of dazzling illusions in life that masquerade as priceless treasures. Discernment is the archer’s greatest arrow.',
    sacredWeapon: 'Suryastra Sun-Piercer',
  },
  {
    id: 5,
    chapterId: 5,
    title: 'The Dark Abduction • Raone’s Sky Chariot Flees South',
    hindiTitle: 'सीता हरण, जटायु शौर्य एवं रावण दम्भ',
    kanda: 'Aranya Kanda (अरण्यकाण्ड)',
    location: 'Ashram Clearings & Southern Skies',
    readTime: '5 min read',
    dateTag: 'Treta Yuga • Sacred Chronicle V',
    sacredSloka: {
      sanskrit: 'न कालमतिवर्तन्ते महावृक्षाः समाहिताः। सर्वं हि विहितं दैवात्कालो हि दुरतिक्रमः॥',
      transliteration: 'Na kālamativartante mahāvṛkṣāḥ samāhitāḥ | Sarvaṁ hi vihitaṁ daivātkālo hi duratikramaḥ ||',
      meaning: 'Even the mightiest rooted trees cannot escape the turn of Time. Everything is ordained; Time’s decree cannot be traversed.',
    },
    summary: 'Disguised as a wandering mendicant, King Raone breaches the sanctuary. In a flash of thunderous black iron, he seizes Purneema and ascends into the heavens on the Pushpaka Vimana.',
    keyStoryBlog: [
      'Taking advantage of Umesh’s absence, King Raone of Lanka arrived at the threshold of the hermitage disguised as an elderly sanyasin chanting hymns. The hospitable Purneema stepped forward with offerings of sacred fruits and water.',
      'Revealing his terrifying ten-headed royal guise, Raone seized Purneema by force. Summonsing his celestial sky chariot, the Pushpaka Vimana, he soared into the southern clouds as Purneema cried out into the wilderness: "Umesh! Save me!"',
      'The aged eagle-king Jatayu heard her cries and soared into the sky, smashing Raone’s chariot and cleaving the demon’s armor with his talons. Though slain by Raone’s Chandrahas blade, Jatayu survived long enough to whisper the fateful direction to the weeping Umesh.',
      'Standing amidst the silent ashes of Panchavati, Umesh clenched his fists. The bow hummed with celestial fire. A vow was sealed across heaven and earth: Raone and his kingdom of arrogance would fall.',
    ],
    antagonistProfile: {
      name: 'Raone (Lanka Emperor)',
      hindiName: 'दशानन रावण',
      title: 'Sovereign of the Three Worlds & Master of Pushpaka',
      description: 'Possessing boons from Brahma, immense physical strength, and 10 heads representing mastery of all 6 Shastras and 4 Vedas turned to ego.',
      threatLevel: 'Cataclysmic',
    },
    dharmaLesson: 'Grief must not paralyze the soul; it must be transformed into unyielding determination for cosmic justice.',
    sacredWeapon: 'The Unbroken Vow of Kodanda',
  },
  {
    id: 6,
    chapterId: 6,
    title: 'The Vanara Alliance & The Seven Sal Trees of Kishkindha',
    hindiTitle: 'किष्किन्धा काण्ड • सुग्रीव मैत्री एवं वालि वध',
    kanda: 'Kishkindha Kanda (किष्किन्धाकाण्ड)',
    location: 'Pampa Lake & Rishyamukha Mountain',
    readTime: '4 min read',
    dateTag: 'Treta Yuga • Sacred Chronicle VI',
    sacredSloka: {
      sanskrit: 'मित्राणि धनधान्यानि मित्राणि स्वजनास्तथा। मित्रवन्तो हि जीवन्ति मित्राणि परमो निधिः॥',
      transliteration: 'Mitrāṇi dhanadhānyāni mitrāṇi svajanāstathā | Mitravanto hi jīvanti mitrāṇi paramo nidhiḥ ||',
      meaning: 'Friends are true wealth and nourishment; friends are one’s own family. Those with noble friends truly live; sacred friendship is the highest treasure.',
    },
    summary: 'At the shimmering Pampa lake, Umesh meets Hanuman and King Sugriva. Before the monkey host unites to scour the continents, Umesh proves his divine archery by piercing seven massive Sal trees with a single arrow.',
    keyStoryBlog: [
      'Wandering through the rugged canyons of Kishkindha, Umesh and his brother met the noble minister Hanuman, incarnation of divine wind and supreme devotion. Before the sacred fire, Umesh and the exiled Vanara king Sugriva pledged eternal brotherhood.',
      'To demonstrate that his archery could overcome the seemingly invincible king Vali—who absorbed half the strength of any opponent who faced him—Umesh released a single golden shaft.',
      'The divine arrow sped like a comet, piercing through seven ancient Sal trees, penetrating the subterranean crust, and returning flawlessly to his quiver. Restoring justice to Kishkindha, Sugriva marshaled millions of brave Vanaras to search every corner of the Earth.',
    ],
    antagonistProfile: {
      name: 'Vali',
      hindiName: 'महाबली वालि',
      title: 'The Invincible Sovereign of Kishkindha',
      description: 'Blessed with a celestial golden necklace and the boon to absorb half the physical power of anyone who confronts him in duel.',
      threatLevel: 'Severe',
    },
    dharmaLesson: 'Humility and sacred alliances amplify righteous power. True leadership elevates friends and uplifts the oppressed.',
    sacredWeapon: 'Sapta-Tala Piercing Arrow',
  },
  {
    id: 7,
    chapterId: 7,
    title: 'Bridge of Faith • Consecration of Rama Setu',
    hindiTitle: 'सुन्दर सेतु बन्धन • सागर मन्थन',
    kanda: 'Sundara & Yuddha Kanda (सुन्दर व युद्धकाण्ड)',
    location: 'Rameshwaram Coastline & Southern Ocean',
    readTime: '4 min read',
    dateTag: 'Treta Yuga • Sacred Chronicle VII',
    sacredSloka: {
      sanskrit: 'समुद्रमिव गाम्भीर्ये धैर्येण हिमवानिव। विष्णुना सदृशो वीर्ये सोमवत्प्रियदर्शनः॥',
      transliteration: 'Samudramiva gāmbhīrye dhairyeṇa himavāniva | Viṣṇunā sadṛśo vīrye somavatpriyadarśanaḥ ||',
      meaning: 'Deep as the boundless ocean, steadfast and patient as the Himalayas, valorous as Vishnu, and pleasing to behold as the gentle full moon.',
    },
    summary: 'Standing before the roaring ocean separating the mainland from the island fortress of Lanka, the Vanara legions inscribe the sacred name upon boulders, causing heavy stones to float upon the waves.',
    keyStoryBlog: [
      'The Southern Ocean roared with torrential waves and sea serpents. For three nights, Umesh prayed to the Ocean Deity Varuna for safe passage. When the waves remained obstinate, the archer drew the Brahmastra, causing the waters to boil and the sky to tremble.',
      'Varuna emerged from the depths, bowing with folded hands: "O Lord, under the touch of master architects Nala and Nila, let the stones be consecrated in your name. They shall defy gravity and float upon my waves!"',
      'Vanaras and bears carried whole mountain peaks. Inscribing the sacred syllable upon each stone, they cast them into the deep. A majestic bridge of floating stone bridged the continent to Lanka, proving that faith can make the heaviest burdens float.',
    ],
    antagonistProfile: {
      name: 'Ocean Tempests & Rakshasa Guards',
      hindiName: 'समुद्र राक्षस पहरेदार',
      title: 'Sentinels of the Southern Waters',
      description: 'Monstrous sea krakens and coastal Rakshasa sentinels commanded by Lanka to drown approaching armies.',
      threatLevel: 'Severe',
    },
    dharmaLesson: 'When devotion and unity guide our hands, impossible obstacles like raging oceans become solid bridges.',
    sacredWeapon: 'Consecrated Floating Shila of Setu',
  },
  {
    id: 8,
    chapterId: 8,
    title: 'The Golden Citadel of Lanka & The Slumbering Titan Kumbhakarna',
    hindiTitle: 'स्वर्ण लङ्का दुर्ग एवं कुम्भकर्ण महायुद्ध',
    kanda: 'Yuddha Kanda (युद्धकाण्ड)',
    location: 'Northern Fortress Gates of Trikuta Hill, Lanka',
    readTime: '5 min read',
    dateTag: 'Treta Yuga • Sacred Chronicle VIII',
    sacredSloka: {
      sanskrit: 'न भयं विन्दते किञ्चिद् युध्यमानः समाहितः। धर्मो रक्षति रक्षितः तस्माद् धर्मं न संत्यजेत्॥',
      transliteration: 'Na bhayaṁ vindate kiñcid yudhyamānaḥ samāhitaḥ | Dharmo rakṣati rakṣitaḥ tasmād dharmaṁ na saṁtyajet ||',
      meaning: 'One steadfast in mind experiences no fear in righteous battle. Dharma protects those who protect Dharma; therefore, never abandon Dharma.',
    },
    summary: 'Golden battlements gleam under a blood-red moon. To halt the advancing army of Dharma, Raone awakes his gargantuan brother Kumbhakarna from six months of deep mystical slumber.',
    keyStoryBlog: [
      'Lanka stood fortified with moats of boiling oil, walls of pure gold, and towers bristling with magical catapults. As the Vanara vanguard battered the northern gates, a colossal shadow fell over the battlefield.',
      'It was Kumbhakarna, a titan whose single stride shook the earth like an earthquake. Though he had reprimanded his brother Raone for kidnapping another man’s wife, warrior loyalty bound him to fight for his king.',
      'Wielding a giant spiked mace that crushed whole platoons, Kumbhakarna charged Umesh. Evading the titan’s colossal blows with agile leaps, Umesh unleashed the Indrastra, cleaving the titan’s weapons and delivering peaceful liberation to the fallen colossus.',
    ],
    antagonistProfile: {
      name: 'Kumbhakarna',
      hindiName: 'कुम्भकर्ण',
      title: 'Colossal Mountain Titan of Lanka',
      description: 'A giant of unmatched physical stature whose footsteps trigger tremors; possesses immense strength and a spiked mace capable of shattering castle walls.',
      threatLevel: 'Legendary',
    },
    dharmaLesson: 'Blind loyalty to an evil ruler, even out of brotherly affection, leads inevitably to destruction. Righteousness must always outrank blood.',
    sacredWeapon: 'Indrastra Lightning Arrow',
  },
  {
    id: 9,
    chapterId: 9,
    title: 'The Sorcery of Indrajit • Cosmic Astras & The Invisible Veil',
    hindiTitle: 'मेघनाद माया एवं इन्द्रजित् पतन',
    kanda: 'Yuddha Kanda (युद्धकाण्ड)',
    location: 'Nikumbhila Sacrificial Altar & Lanka Sky',
    readTime: '4 min read',
    dateTag: 'Treta Yuga • Sacred Chronicle IX',
    sacredSloka: {
      sanskrit: 'सत्यं वद धर्मं चर स्वाध्यायान्मा प्रमदः। सत्यान्न प्रमदितव्यम्॥',
      transliteration: 'Satyaṁ vada dharmaṁ cara svādhyāyānmā pramadaḥ | Satyānna pramaditavyam ||',
      meaning: 'Speak the truth, abide in Dharma, never neglect study and righteous practice. Never stray from the path of truth.',
    },
    summary: 'Master of the illusions of the clouds and conqueror of heaven, Prince Indrajit fights from behind invisible clouds using Brahmastra and Nagapasha. Only pure spiritual mastery can pierce his mystic veil.',
    keyStoryBlog: [
      'Prince Meghanada had conquered Indra and acquired the title Indrajit. Wielding dark invisibility sorcery, he fired venomous serpent arrows (Nagapasha) from the clouds without being seen.',
      'At the secret grove of Nikumbhila, Indrajit attempted to complete a dark yajna that would render him permanently invincible. Armed with divine guidance and unblemished celibate discipline, the vanguard disrupted the sacrificial smoke.',
      'In a legendary duel of archery where celestial Astras clashed like thunderbolts in the sky, Umesh revealed the inner eye of spiritual vision, locating Indrajit behind his veil of shadow and shattering the crown of Lanka’s greatest sorcerer.',
    ],
    antagonistProfile: {
      name: 'Indrajit (Meghanada)',
      hindiName: 'इन्द्रजित् (मेघनाद)',
      title: 'The Invisible Cloud Sorcerer of Lanka',
      description: 'The conqueror of the heavenly king Indra, capable of fighting invisibly from cloud cover while hurling astras of lightning and void.',
      threatLevel: 'Legendary',
    },
    dharmaLesson: 'Deceit and invisible trickery may win battles for an hour, but absolute purity of purpose dissolves every veil.',
    sacredWeapon: 'Aindrastra Celestial Strike',
  },
  {
    id: 10,
    chapterId: 10,
    title: 'The Final Battle • The Fall of the Ten-Headed Emperor',
    hindiTitle: 'अन्तिम महायुद्ध • दशानन रावण वध एवं धर्म विजय',
    kanda: 'Yuddha Kanda (युद्धकाण्ड)',
    location: 'Central Battlefield Arena of Lanka',
    readTime: '6 min read',
    dateTag: 'Treta Yuga • Sacred Chronicle X',
    sacredSloka: {
      sanskrit: 'धर्मात्मा सत्यसन्धश्च रामो दाशरथिर्महान्। न हि तस्यास्ति सदृशो वीर्ये लोकेषु कश्चन॥',
      transliteration: 'Dharmātmā satyasandhaśca rāmo dāśarathirmahān | Na hi tasyāsti sadṛśo vīrye lokeṣu kaścana ||',
      meaning: 'Righteous in soul, unwavering in his pledge, great is Rama, son of Dasharatha. There is none equal to him in valor across all the worlds.',
    },
    summary: 'The climactic confrontation of the Treta Yuga. King Raone emerges on his flaming war chariot, wielding the Chandrahas sword, cosmic Astras, and his ten immortal heads. Only the consecrated Brahmastra can pierce his heart.',
    keyStoryBlog: [
      'All commanders had fallen. The ten gates of Lanka stood shattered. Finally, the golden gates opened and Emperor Raone emerged, his eyes blazing with cosmic rage. Mounted on a war chariot pulled by hellhounds and dark stallions, his ten crowned heads mocked the heavens.',
      'The clash between Umesh and Raone was unlike anything seen in creation. Sky and earth shuddered. For every head severed by Umesh’s golden arrows, another sprouted instantly by virtue of Raone’s boons from Brahma. The emperor summoned dark lightning barriers, hurled flaming Chandrahas blades, and created shadow duplicates.',
      'As the battle reached sunset, Sage Agastya whispered the Aditya Hridaya Stotram—the hymn to the radiant Sun Deity that bestows eternal victory. Consecrating the supreme Brahmastra arrow, gifted by the creator himself, Umesh aimed not at the multiplying heads, but directly at the emperor’s chest where the nectar of immortality was concealed.',
      'With a sound that drowned out the thunder of oceans, the divine arrow struck. Raone fell from his chariot, his ego shattered, begging forgiveness for his arrogance. Dharma was restored, Purneema was liberated, and the lamps of Diwali were lit across Ayodhya to welcome the righteous king home.',
    ],
    antagonistProfile: {
      name: 'Mahabali Raone (Dishanana)',
      hindiName: 'दशानन रावण',
      title: 'The Ten-Headed Emperor of Lanka',
      description: 'The supreme antagonist of the epic. Wields multi-phase combat: Chandrahas sword strikes, dark homing missiles, impenetrable lightning shields, and catastrophic ground quakes.',
      threatLevel: 'Cataclysmic',
    },
    dharmaLesson: 'Ego and greed, no matter how immense or backed by heavenly boons, will always collapse before the tranquil arrow of Truth and Selfless Duty.',
    sacredWeapon: 'The Supreme Brahmastra (ब्रह्मास्त्र)',
  },
];
