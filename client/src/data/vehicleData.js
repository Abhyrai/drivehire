// Indian car and bike brands with their popular models
export const carBrands = {
    'Maruti Suzuki': ['Alto', 'WagonR', 'Swift', 'Dzire', 'Baleno', 'Brezza', 'Ertiga', 'XL6', 'Ciaz', 'S-Cross', 'Ignis', 'Celerio', 'Fronx', 'Jimny', 'Invicto', 'Grand Vitara'],
    'Hyundai': ['i10', 'i20', 'Verna', 'Creta', 'Venue', 'Tucson', 'Alcazar', 'Aura', 'Exter', 'Ioniq 5'],
    'Tata': ['Nexon', 'Punch', 'Harrier', 'Safari', 'Altroz', 'Tiago', 'Tigor', 'Curvv'],
    'Mahindra': ['Thar', 'Scorpio', 'Scorpio-N', 'XUV700', 'XUV400', 'XUV300', 'Bolero', 'Bolero Neo', 'Marazzo', 'BE 6'],
    'Kia': ['Seltos', 'Sonet', 'Carens', 'EV6', 'EV9'],
    'Toyota': ['Fortuner', 'Innova Crysta', 'Innova Hycross', 'Glanza', 'Urban Cruiser Hyryder', 'Camry', 'Hilux', 'Land Cruiser'],
    'Honda': ['City', 'Amaze', 'Elevate', 'WR-V'],
    'MG': ['Hector', 'Hector Plus', 'Astor', 'ZS EV', 'Gloster', 'Comet EV'],
    'Skoda': ['Kushaq', 'Slavia', 'Kodiaq', 'Superb'],
    'Volkswagen': ['Taigun', 'Virtus', 'Tiguan'],
    'Renault': ['Kwid', 'Triber', 'Kiger'],
    'Nissan': ['Magnite', 'X-Trail'],
    'Jeep': ['Compass', 'Meridian', 'Wrangler', 'Grand Cherokee'],
    'Citroen': ['C3', 'C3 Aircross', 'C5 Aircross', 'eC3'],
    'BMW': ['3 Series', '5 Series', '7 Series', 'X1', 'X3', 'X5', 'X7', 'iX', 'i4', 'i7', 'M340i'],
    'Mercedes-Benz': ['A-Class', 'C-Class', 'E-Class', 'S-Class', 'GLA', 'GLB', 'GLC', 'GLE', 'GLS', 'EQS', 'AMG GT'],
    'Audi': ['A4', 'A6', 'A8', 'Q3', 'Q5', 'Q7', 'Q8', 'e-tron', 'RS5'],
    'Volvo': ['XC40', 'XC60', 'XC90', 'S60', 'S90'],
    'Land Rover': ['Defender', 'Discovery Sport', 'Range Rover Evoque', 'Range Rover Sport', 'Range Rover Velar'],
    'Porsche': ['Cayenne', 'Macan', 'Taycan', '911'],
    'Lexus': ['ES', 'NX', 'RX', 'LX', 'LC'],
    'BYD': ['Atto 3', 'Seal', 'e6'],
};

export const bikeBrands = {
    'Hero': ['Splendor', 'HF Deluxe', 'Glamour', 'Passion Pro', 'Xtreme 160R', 'Xpulse 200', 'Karizma XMR'],
    'Honda': ['Activa', 'Shine', 'Unicorn', 'SP125', 'Hornet 2.0', 'CB350', 'CB300R', 'Dio'],
    'Bajaj': ['Pulsar', 'Platina', 'CT100', 'Dominar 400', 'Avenger', 'KTM Duke 200', 'KTM Duke 390'],
    'TVS': ['Apache RTR', 'Jupiter', 'Ntorq', 'Raider', 'Ronin', 'Star City'],
    'Royal Enfield': ['Classic 350', 'Meteor 350', 'Bullet 350', 'Hunter 350', 'Continental GT 650', 'Interceptor 650', 'Himalayan', 'Super Meteor 650', 'Shotgun 650'],
    'Yamaha': ['FZ', 'R15', 'MT-15', 'Ray ZR', 'Fascino', 'FZS-FI'],
    'Suzuki': ['Access 125', 'Gixxer', 'Burgman Street', 'V-Strom', 'Hayabusa'],
    'KTM': ['Duke 125', 'Duke 200', 'Duke 250', 'Duke 390', 'RC 200', 'RC 390', 'Adventure 250', 'Adventure 390'],
    'Kawasaki': ['Ninja 300', 'Ninja 400', 'Ninja 650', 'Z650', 'Z900', 'Versys 650'],
    'Triumph': ['Speed 400', 'Scrambler 400X', 'Tiger Sport 660', 'Bonneville', 'Trident 660'],
    'Jawa': ['Jawa 42', 'Perak', 'Yezdi Adventure', 'Yezdi Roadster'],
    'Ola': ['S1 Pro', 'S1 X', 'S1 Air'],
    'Ather': ['450X', '450S', 'Rizta'],
};

export const getBrandList = (type) => {
    return Object.keys(type === 'bike' ? bikeBrands : carBrands).sort();
};

export const getModelList = (type, brand) => {
    const data = type === 'bike' ? bikeBrands : carBrands;
    return data[brand] || [];
};
