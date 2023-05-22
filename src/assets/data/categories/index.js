const availCategories = [
    {
        value: 'C1', 
        label: 'Personal Care & Services',
        subcategories: [
            {
                value: '1', 
                label: 'Animal Care & Supplies',
            },
            {
                value: '2', 
                label: 'Barber & Beauty Salons',
            },
            {
                value: '3', 
                label: 'Beauty Supplies',
            },
            {
                value: '4', 
                label: 'Dry Cleaners & Laundromats',
            },
            {
                value: '5', 
                label: 'Exercise & Fitness (Gyms)',
            },
            {
                value: '6', 
                label: 'Massage & Body Works',
            },
            {
                value: '7', 
                label: 'Nail Salons',
            },
            {
                value: '8', 
                label: 'Shoe Repairs',
            },
            {
                value: '9', 
                label: 'Tailors',
            },
        ]
    },
    {
        value: 'C2', 
        label: 'Automotive',
        subcategories: [
            {
                value: '10', 
                label: 'Auto Accessories',
            },
            {
                value: '11', 
                label: 'Auto Dealers - New',
            },
            {
                value: '12', 
                label: 'Auto Dealers - Old',
            },
            {
                value: '13', 
                label: 'Detail & Carwash',
            },
            {
                value: '14', 
                label: 'Gas Stations',
            },
            {
                value: '15', 
                label: 'Motorcycles Sales & Repair',
            },
            {
                value: '16', 
                label: 'Rental & Leasing',
            },
            {
                value: '17', 
                label: 'Service, Repair & Parts',
            },
            {
                value: '18', 
                label: 'Towing',
            }
        ]
    },
    {
        value: 'C3',
        label: 'Health & Medical',
        subcategories: [
            {
                value: '19', 
                label: 'Acupuncture',
            },
            {
                value: '20', 
                label: 'Assisted living & home health care',
            },
            {
                value: '21', 
                label: 'Audiologists',
            },
            {
                value: '22', 
                label: 'Chiropractic',
            },
            {
                value: '23', 
                label: 'Clinics & Medical Centers',
            },
            {
                value: '24', 
                label: 'Dental',
            },
            {
                value: '25', 
                label: 'Diet & Nutrition',
            },
            {
                value: '26', 
                label: 'Laboratory, Imaging & Diagnostics',
            },
            {
                value: '27', 
                label: 'Massage therapy',
            },
            {
                value: '28', 
                label: 'Mental Health',
            },
            {
                value: '29', 
                label: 'Nurse',
            },
            {
                value: '30', 
                label: 'Optical',
            },
            {
                value: '31', 
                label: 'Pharmacy, Drug & Vitamin Stores',
            },
            {
                value: '32', 
                label: 'Physical therapy',
            },
            {
                value: '33', 
                label: 'Physicians & Assistants',
            },
            {
                value: '34', 
                label: 'Podiatry',
            },
            {
                value: '35', 
                label: 'Social Worker',
            },
            {
                value: '36', 
                label: 'Animal Hospital',
            },
            {
                value: '37', 
                label: 'Veterinary & Animal Surgeons',
            }
        ]
    },
    {
        value: 'C4', 
        label: 'Home & Garden',
        subcategories: [
            {
                value: '38', 
                label: 'Antiques & Collectibles',
            },
            {
                value: '39', 
                label: 'Cleaning',
            },
            {
                value: '40', 
                label: 'Crafts, Hobbies & Sports',
            },
            {
                value: '41', 
                label: 'Flower shops',
            },
            {
                value: '42', 
                label: 'Home Furnishing',
            },
            {
                value: '43', 
                label: 'Home Goods',
            },
            {
                value: '44', 
                label: 'Home improvement & repairs',
            },
            {
                value: '45', 
                label: 'Landscape & Lawn services',
            },
            {
                value: '46', 
                label: 'Pest control',
            },
            {
                value: '47', 
                label: 'Pool supplies & service',
            },
            {
                value: '48', 
                label: 'Security System & services',
            }
        ]
    },
    {
        value: 'C5', 
        label: 'Travel & Transportation',
        subcategories: [
            {
                value: '49', 
                label: 'Hotel, Motel & Extended Stay',
            },
            {
                value: '50', 
                label: 'Moving & Storage',
            },
            {
                value: '51', 
                label: 'Packaging & Shipping',
            },
            {
                value: '52', 
                label: 'Car rentals & Transportation',
            },
            {
                value: '53', 
                label: 'Travel & tourism',
            }
        ]
    },
    {
        value: 'C6', 
        label: 'Education',
        subcategories: [
            {
                value: '54', 
                label: 'Adult & continuing education',
            },
            {
                value: '55', 
                label: 'Early Childhood Education',
            },
            {
                value: '56', 
                label: 'Educational Resources',
            },
            {
                value: '57', 
                label: 'Other Educational',
            }
        ]
    },
    {
        value: 'C7', 
        label: 'Professional Services & Government',
        subcategories: [
            {
                value: '58', 
                label: 'Civic groups',
            },
            {
                value: '59', 
                label: 'Funeral service providers & cemetaries',
            },
            {
                value: '60', 
                label: 'Utility Companies',
            },
            {
                value: '61', 
                label: 'Architects, Landscape Architects',
            },
            {
                value: '62', 
                label: 'Blasting & Demolition',
            },
            {
                value: '63', 
                label: 'Building Materials & Supplies',
            },
            {
                value: '64', 
                label: 'Construction Companies',
            },
            {
                value: '65', 
                label: 'Electricians',
            },
            {
                value: '66', 
                label: 'Engineer, Survey',
            },
            {
                value: '67', 
                label: 'Environmental assessments',
            },
            {
                value: '68', 
                label: 'Inspectors',
            },
            {
                value: '69', 
                label: 'Plaster & Concrete',
            },
            {
                value: '70', 
                label: 'Plumbers',
            },
            {
                value: '71', 
                label: 'Roofers',
            },
            {
                value: '72', 
                label: 'Import & Export',
            }
        ]
    },
    {
        value: 'C8', 
        label: 'Legal & Financial Services',
        subcategories: [
            {
                value: '73', 
                label: 'Accountants',
            },
            {
                value: '74', 
                label: 'Attorneys',
            },
            {
                value: '75', 
                label: 'Financial Institutions',
            },
            {
                value: '76', 
                label: 'Financial Services',
            },
            {
                value: '77', 
                label: 'Insurance',
            },
            {
                value: '78', 
                label: 'Other legal',
            }
        ]
    },
    {
        value: 'C9', 
        label: 'Retail & Merchants',
        subcategories: [
            {
                value: '79',
                label: 'Gift Shops',
            },
            {
                value: '80', 
                label: 'Clothing & accessories',
            },
            {
                value: '81', 
                label: 'Department stores, sporting goods',
            },
            {
                value: '82', 
                label: 'General',
            },
            {
                value: '83', 
                label: 'Jewelry',
            },
            {
                value: '84', 
                label: 'Shoes',
            },
            {
                value: '85', 
                label: 'Wholesale',
            },
            {
                value: '86', 
                label: 'Manufacturing',
            }   
        ]
    },
    {
        value: 'C10', 
        label: 'Hospitality & Entertainment',
        subcategories: [
            {
                value: '87', 
                label: 'Desserts, catering & supplies',
            },
            {
                value: '88', 
                label: 'Fast Food & Carry out',
            },
            {
                value: '89', 
                label: 'Grocery, Beverage & Tobacco',
            },
            {
                value: '90', 
                label: 'Restaurants',
            },
            {
                value: '91', 
                label: 'Bars',
            },
            {
                value: '92', 
                label: 'Nightclubs',
            },
            {
                value: '93', 
                label: 'Artists, writers',
            },
            {
                value: '94', 
                label: 'Event planners & supplies',
            },
            {
                value: '95', 
                label: 'Golf courses',
            },
            {
                value: '96', 
                label: 'Movies',
            },
            {
                value: '97', 
                label: 'Production',
            }
        ]
    }
];

export default availCategories;