import React, { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// Generations database: brand -> model -> generations
const generationsDB = {
  BMW: {
    '1 Series': [
      { code: 'E81', years: '2004–2013' },
      { code: 'F20', years: '2011–2019' },
      { code: 'F40', years: '2019–н.в.' },
    ],
    '2 Series': [
      { code: 'F22', years: '2014–2021' },
      { code: 'G42', years: '2021–н.в.' },
    ],
    '3 Series': [
      { code: 'E21', years: '1975–1983' },
      { code: 'E30', years: '1982–1994' },
      { code: 'E36', years: '1990–2000' },
      { code: 'E46', years: '1997–2006' },
      { code: 'E90', years: '2005–2013' },
      { code: 'F30', years: '2011–2019' },
      { code: 'G20', years: '2018–н.в.' },
    ],
    '4 Series': [
      { code: 'F32', years: '2013–2020' },
      { code: 'G22', years: '2020–н.в.' },
    ],
    '5 Series': [
      { code: 'E12', years: '1972–1981' },
      { code: 'E28', years: '1981–1988' },
      { code: 'E34', years: '1988–1996' },
      { code: 'E39', years: '1995–2004' },
      { code: 'E60', years: '2003–2010' },
      { code: 'F10', years: '2010–2017' },
      { code: 'G30', years: '2016–2023' },
      { code: 'G60', years: '2023–н.в.' },
    ],
    '6 Series': [
      { code: 'E24', years: '1976–1989' },
      { code: 'E63', years: '2003–2010' },
      { code: 'F12', years: '2011–2018' },
    ],
    '7 Series': [
      { code: 'E23', years: '1977–1986' },
      { code: 'E32', years: '1986–1994' },
      { code: 'E38', years: '1994–2001' },
      { code: 'E65', years: '2001–2008' },
      { code: 'F01', years: '2008–2015' },
      { code: 'G11', years: '2015–2022' },
      { code: 'G70', years: '2022–н.в.' },
    ],
    '8 Series': [
      { code: 'E31', years: '1989–1999' },
      { code: 'G15', years: '2018–н.в.' },
    ],
    'X1': [
      { code: 'E84', years: '2009–2015' },
      { code: 'F48', years: '2015–2022' },
      { code: 'U11', years: '2022–н.в.' },
    ],
    'X2': [
      { code: 'F39', years: '2018–2023' },
      { code: 'U10', years: '2024–н.в.' },
    ],
    'X3': [
      { code: 'E83', years: '2003–2010' },
      { code: 'F25', years: '2010–2017' },
      { code: 'G01', years: '2017–н.в.' },
    ],
    'X4': [
      { code: 'F26', years: '2014–2018' },
      { code: 'G02', years: '2018–н.в.' },
    ],
    'X5': [
      { code: 'E53', years: '1999–2006' },
      { code: 'E70', years: '2006–2013' },
      { code: 'F15', years: '2013–2018' },
      { code: 'G05', years: '2018–н.в.' },
    ],
    'X6': [
      { code: 'E71', years: '2008–2014' },
      { code: 'F16', years: '2014–2019' },
      { code: 'G06', years: '2019–н.в.' },
    ],
    'X7': [
      { code: 'G07', years: '2018–н.в.' },
    ],
    'Z3': [
      { code: 'E36', years: '1995–2002' },
    ],
    'Z4': [
      { code: 'E85', years: '2002–2008' },
      { code: 'E89', years: '2009–2016' },
      { code: 'G29', years: '2018–н.в.' },
    ],
    'i3': [
      { code: 'I01', years: '2013–2022' },
    ],
    'i4': [
      { code: 'G26', years: '2021–н.в.' },
    ],
    'i5': [
      { code: 'G60', years: '2023–н.в.' },
    ],
    'i7': [
      { code: 'G70', years: '2022–н.в.' },
    ],
    'i8': [
      { code: 'I12', years: '2014–2020' },
    ],
    'iX': [
      { code: 'I20', years: '2021–н.в.' },
    ],
    'iX1': [
      { code: 'U11', years: '2022–н.в.' },
    ],
    'iX3': [
      { code: 'G08', years: '2020–н.в.' },
    ],
  },
  'Mercedes-Benz': {
    'C-Class': [
      { code: 'W202', years: '1993–2000' },
      { code: 'W203', years: '2000–2007' },
      { code: 'W204', years: '2007–2014' },
      { code: 'W205', years: '2014–2021' },
      { code: 'W206', years: '2021–н.в.' },
    ],
    'E-Class': [
      { code: 'W124', years: '1984–1997' },
      { code: 'W210', years: '1995–2003' },
      { code: 'W211', years: '2002–2009' },
      { code: 'W212', years: '2009–2016' },
      { code: 'W213', years: '2016–н.в.' },
    ],
    'S-Class': [
      { code: 'W140', years: '1991–1998' },
      { code: 'W220', years: '1998–2005' },
      { code: 'W221', years: '2005–2013' },
      { code: 'W222', years: '2013–2020' },
      { code: 'W223', years: '2020–н.в.' },
    ],
    'GLE': [
      { code: 'W164 (ML)', years: '2005–2011' },
      { code: 'W166 (ML)', years: '2011–2015' },
      { code: 'W166 (GLE)', years: '2015–2019' },
      { code: 'V167', years: '2019–н.в.' },
    ],
  },
  Audi: {
    'A3': [
      { code: '8L', years: '1996–2003' },
      { code: '8P', years: '2003–2013' },
      { code: '8V', years: '2012–2020' },
      { code: '8Y', years: '2020–н.в.' },
    ],
    'A4': [
      { code: 'B5', years: '1994–2001' },
      { code: 'B6', years: '2000–2006' },
      { code: 'B7', years: '2004–2008' },
      { code: 'B8', years: '2007–2016' },
      { code: 'B9', years: '2015–н.в.' },
    ],
    'A6': [
      { code: 'C4', years: '1994–1997' },
      { code: 'C5', years: '1997–2004' },
      { code: 'C6', years: '2004–2011' },
      { code: 'C7', years: '2011–2018' },
      { code: 'C8', years: '2018–н.в.' },
    ],
    'Q5': [
      { code: '8R', years: '2008–2017' },
      { code: 'FY', years: '2016–н.в.' },
    ],
    'Q7': [
      { code: '4L', years: '2005–2015' },
      { code: '4M', years: '2015–н.в.' },
    ],
  },
  Volkswagen: {
    'Golf': [
      { code: 'Mk3', years: '1991–1998' },
      { code: 'Mk4', years: '1997–2006' },
      { code: 'Mk5', years: '2003–2008' },
      { code: 'Mk6', years: '2008–2013' },
      { code: 'Mk7', years: '2012–2020' },
      { code: 'Mk8', years: '2019–н.в.' },
    ],
    'Passat': [
      { code: 'B5', years: '1996–2005' },
      { code: 'B6', years: '2005–2010' },
      { code: 'B7', years: '2010–2015' },
      { code: 'B8', years: '2014–н.в.' },
    ],
    'Tiguan': [
      { code: '5N', years: '2007–2018' },
      { code: 'AD1', years: '2016–н.в.' },
    ],
    'Polo': [
      { code: 'Mk4', years: '2001–2009' },
      { code: 'Mk5', years: '2009–2018' },
      { code: 'Mk6', years: '2017–н.в.' },
    ],
  },
  Toyota: {
    'Camry': [
      { code: 'V40', years: '2006–2011' },
      { code: 'V50', years: '2011–2017' },
      { code: 'V70', years: '2017–н.в.' },
    ],
    'Corolla': [
      { code: 'E120', years: '2001–2007' },
      { code: 'E140', years: '2006–2013' },
      { code: 'E160', years: '2012–2018' },
      { code: 'E210', years: '2018–н.в.' },
    ],
    'RAV4': [
      { code: 'XA30', years: '2005–2012' },
      { code: 'XA40', years: '2012–2018' },
      { code: 'XA50', years: '2018–н.в.' },
    ],
    'Land Cruiser': [
      { code: 'J100', years: '1998–2007' },
      { code: 'J200', years: '2007–2021' },
      { code: 'J300', years: '2021–н.в.' },
    ],
  },
  Honda: {
    'Civic': [
      { code: '7th gen', years: '2000–2005' },
      { code: '8th gen', years: '2005–2011' },
      { code: '9th gen', years: '2011–2015' },
      { code: '10th gen', years: '2015–2021' },
      { code: '11th gen', years: '2021–н.в.' },
    ],
    'Accord': [
      { code: '7th gen', years: '2002–2008' },
      { code: '8th gen', years: '2007–2013' },
      { code: '9th gen', years: '2012–2017' },
      { code: '10th gen', years: '2017–н.в.' },
    ],
    'CR-V': [
      { code: 'RD', years: '1995–2001' },
      { code: 'RD5', years: '2001–2006' },
      { code: 'RE', years: '2006–2011' },
      { code: 'RM', years: '2011–2018' },
      { code: 'RW', years: '2018–н.в.' },
    ],
  },
  Mazda: {
    'Mazda 3': [
      { code: 'BK', years: '2003–2009' },
      { code: 'BL', years: '2008–2013' },
      { code: 'BM', years: '2013–2019' },
      { code: 'BP', years: '2019–н.в.' },
    ],
    'Mazda 6': [
      { code: 'GG', years: '2002–2007' },
      { code: 'GH', years: '2007–2012' },
      { code: 'GJ', years: '2012–н.в.' },
    ],
    'CX-5': [
      { code: 'KE', years: '2011–2017' },
      { code: 'KF', years: '2017–н.в.' },
    ],
  },
  Nissan: {
    'Qashqai': [
      { code: 'J10', years: '2006–2014' },
      { code: 'J11', years: '2013–2021' },
      { code: 'J12', years: '2021–н.в.' },
    ],
    'X-Trail': [
      { code: 'T30', years: '2000–2007' },
      { code: 'T31', years: '2007–2014' },
      { code: 'T32', years: '2013–н.в.' },
    ],
    'Leaf': [
      { code: 'ZE0', years: '2010–2017' },
      { code: 'ZE1', years: '2017–н.в.' },
    ],
  },
  Hyundai: {
    'Tucson': [
      { code: 'JM', years: '2004–2010' },
      { code: 'LM', years: '2009–2015' },
      { code: 'TL', years: '2015–2020' },
      { code: 'NX4', years: '2020–н.в.' },
    ],
    'i30': [
      { code: 'FD', years: '2007–2012' },
      { code: 'GD', years: '2011–2017' },
      { code: 'PD', years: '2016–н.в.' },
    ],
    'Santa Fe': [
      { code: 'SM', years: '2000–2006' },
      { code: 'CM', years: '2006–2012' },
      { code: 'DM', years: '2012–2018' },
      { code: 'TM', years: '2018–н.в.' },
    ],
  },
  Kia: {
    'Sportage': [
      { code: 'JE', years: '2004–2010' },
      { code: 'SL', years: '2010–2015' },
      { code: 'QL', years: '2015–2021' },
      { code: 'NQ5', years: '2021–н.в.' },
    ],
    'Ceed': [
      { code: 'ED', years: '2006–2012' },
      { code: 'JD', years: '2012–2018' },
      { code: 'CD', years: '2018–н.в.' },
    ],
    'Cerato': [
      { code: 'LD', years: '2003–2009' },
      { code: 'TD', years: '2008–2013' },
      { code: 'YD', years: '2012–2018' },
      { code: 'BD', years: '2018–н.в.' },
    ],
  },
  Skoda: {
    'Octavia': [
      { code: 'A4', years: '1996–2010' },
      { code: 'A5', years: '2004–2013' },
      { code: 'A7', years: '2012–2020' },
      { code: 'A8', years: '2019–н.в.' },
    ],
    'Superb': [
      { code: 'B5', years: '2001–2008' },
      { code: 'B6', years: '2008–2015' },
      { code: 'B8', years: '2015–н.в.' },
    ],
    'Kodiaq': [
      { code: '1st gen', years: '2016–2023' },
      { code: '2nd gen', years: '2023–н.в.' },
    ],
  },
  Volvo: {
    'XC60': [
      { code: 'Mk1', years: '2008–2017' },
      { code: 'Mk2', years: '2017–н.в.' },
    ],
    'XC90': [
      { code: 'Mk1', years: '2002–2014' },
      { code: 'Mk2', years: '2014–н.в.' },
    ],
    'V60': [
      { code: 'Mk1', years: '2010–2018' },
      { code: 'Mk2', years: '2018–н.в.' },
    ],
  },
  Ford: {
    'Focus': [
      { code: 'Mk1', years: '1998–2004' },
      { code: 'Mk2', years: '2004–2011' },
      { code: 'Mk3', years: '2010–2018' },
      { code: 'Mk4', years: '2018–н.в.' },
    ],
    'Mondeo': [
      { code: 'Mk1', years: '1993–1996' },
      { code: 'Mk2', years: '1996–2000' },
      { code: 'Mk3', years: '2000–2007' },
      { code: 'Mk4', years: '2007–2014' },
      { code: 'Mk5', years: '2014–2022' },
    ],
    'Kuga': [
      { code: 'Mk1', years: '2008–2013' },
      { code: 'Mk2', years: '2012–2019' },
      { code: 'Mk3', years: '2019–н.в.' },
    ],
  },
  Opel: {
    'Astra': [
      { code: 'G', years: '1998–2004' },
      { code: 'H', years: '2004–2014' },
      { code: 'J', years: '2009–2015' },
      { code: 'K', years: '2015–2022' },
      { code: 'L', years: '2021–н.в.' },
    ],
    'Insignia': [
      { code: 'A', years: '2008–2017' },
      { code: 'B', years: '2017–н.в.' },
    ],
  },
  Renault: {
    'Megane': [
      { code: 'Mk1', years: '1995–2002' },
      { code: 'Mk2', years: '2002–2008' },
      { code: 'Mk3', years: '2008–2015' },
      { code: 'Mk4', years: '2015–н.в.' },
    ],
    'Duster': [
      { code: 'HS', years: '2009–2018' },
      { code: 'HM', years: '2017–н.в.' },
    ],
  },
  Peugeot: {
    '308': [
      { code: 'Mk1', years: '2007–2013' },
      { code: 'Mk2', years: '2013–2021' },
      { code: 'Mk3', years: '2021–н.в.' },
    ],
    '3008': [
      { code: 'Mk1', years: '2008–2016' },
      { code: 'Mk2', years: '2016–н.в.' },
    ],
  },
  Lexus: {
    'RX': [
      { code: 'XU10', years: '1997–2003' },
      { code: 'XU30', years: '2003–2009' },
      { code: 'AL10', years: '2009–2015' },
      { code: 'AL20', years: '2015–2022' },
      { code: 'AL30', years: '2022–н.в.' },
    ],
    'IS': [
      { code: 'XE10', years: '1998–2005' },
      { code: 'XE20', years: '2005–2013' },
      { code: 'XE30', years: '2013–н.в.' },
    ],
  },
  Porsche: {
    'Cayenne': [
      { code: '9PA', years: '2002–2010' },
      { code: '92A', years: '2010–2018' },
      { code: 'PO536', years: '2018–н.в.' },
    ],
    '911': [
      { code: '993', years: '1993–1998' },
      { code: '996', years: '1997–2006' },
      { code: '997', years: '2004–2012' },
      { code: '991', years: '2011–2019' },
      { code: '992', years: '2018–н.в.' },
    ],
  },
  Tesla: {
    'Model 3': [
      { code: '1st gen', years: '2017–2023' },
      { code: 'Highland', years: '2023–н.в.' },
    ],
    'Model S': [
      { code: '1st gen', years: '2012–2021' },
      { code: 'Plaid', years: '2021–н.в.' },
    ],
    'Model Y': [
      { code: '1st gen', years: '2020–2024' },
      { code: 'Juniper', years: '2024–н.в.' },
    ],
  },
  Subaru: {
    'Forester': [
      { code: 'SF', years: '1997–2002' },
      { code: 'SG', years: '2002–2008' },
      { code: 'SH', years: '2008–2013' },
      { code: 'SJ', years: '2012–2018' },
      { code: 'SK', years: '2018–н.в.' },
    ],
    'Outback': [
      { code: 'BH', years: '1999–2004' },
      { code: 'BP', years: '2003–2009' },
      { code: 'BR', years: '2009–2014' },
      { code: 'BS', years: '2014–2020' },
      { code: 'BT', years: '2020–н.в.' },
    ],
  },
  Mitsubishi: {
    'Outlander': [
      { code: 'CW', years: '2005–2012' },
      { code: 'GF', years: '2012–2021' },
      { code: 'GN', years: '2021–н.в.' },
    ],
    'ASX': [
      { code: 'GA', years: '2010–2022' },
      { code: '2nd gen', years: '2022–н.в.' },
    ],
  },
  'Land Rover': {
    'Discovery': [
      { code: 'Mk2', years: '1998–2004' },
      { code: 'Mk3 (LR3)', years: '2004–2009' },
      { code: 'Mk4 (LR4)', years: '2009–2016' },
      { code: 'Mk5', years: '2016–н.в.' },
    ],
    'Range Rover': [
      { code: 'Mk3', years: '2001–2012' },
      { code: 'Mk4', years: '2012–2021' },
      { code: 'Mk5', years: '2021–н.в.' },
    ],
  },
  Jaguar: {
    'XF': [
      { code: 'X250', years: '2007–2015' },
      { code: 'X260', years: '2015–н.в.' },
    ],
    'F-Pace': [
      { code: 'X761', years: '2016–н.в.' },
    ],
  },
  'Alfa Romeo': {
    'Giulia (105/115)': [
      { code: '105/115', years: '1962–1978' },
    ],
    'Giulietta (750/101)': [
      { code: '750/101', years: '1954–1965' },
    ],
    'Giulietta (2010)': [
      { code: '940', years: '2010–2020' },
    ],
    'Giulia (952)': [
      { code: '952', years: '2015–н.в.' },
    ],
    'Alfetta': [
      { code: '116', years: '1972–1987' },
    ],
    'Alfasud': [
      { code: '901', years: '1971–1989' },
    ],
    '33': [
      { code: '905/907', years: '1983–1995' },
    ],
    '75': [
      { code: '162B', years: '1985–1992' },
    ],
    '90': [
      { code: '162', years: '1984–1987' },
    ],
    '145': [
      { code: '930', years: '1994–2001' },
    ],
    '146': [
      { code: '930', years: '1994–2001' },
    ],
    '155': [
      { code: '167', years: '1992–1998' },
    ],
    '156': [
      { code: '932', years: '1997–2007' },
    ],
    '159': [
      { code: '939', years: '2005–2012' },
    ],
    '164': [
      { code: '164', years: '1987–1998' },
    ],
    '166': [
      { code: '936', years: '1998–2007' },
    ],
    '147': [
      { code: '937', years: '2000–2010' },
    ],
    'GT': [
      { code: '937', years: '2003–2010' },
    ],
    'Brera': [
      { code: '939', years: '2005–2010' },
    ],
    'Spider (939)': [
      { code: '939', years: '2006–2010' },
    ],
    'MiTo': [
      { code: '955', years: '2008–2018' },
    ],
    'Giulietta (940)': [
      { code: '940', years: '2010–2020' },
    ],
    '4C': [
      { code: '960', years: '2013–2020' },
    ],
    'Stelvio': [
      { code: '949', years: '2017–н.в.' },
    ],
    'Tonale': [
      { code: '965', years: '2022–н.в.' },
    ],
    'Junior': [
      { code: '970', years: '2024–н.в.' },
    ],
    'GTV (916)': [
      { code: '916', years: '1993–2005' },
    ],
    'Spider (916)': [
      { code: '916', years: '1994–2005' },
    ],
    'Alfa 6': [
      { code: '119', years: '1979–1987' },
    ],
    'Alfa 8C Competizione': [
      { code: '920', years: '2007–2010' },
    ],
    'Crosswagon Q4': [
      { code: '932', years: '2004–2007' },
    ],
  },
};

export default function GenerationPicker({ brand, model, selected = [], onChange }) {
  const generations = brand && model ? (generationsDB[brand]?.[model] || []) : [];

  if (!brand || !model || generations.length === 0) {
    return (
      <div className="text-sm text-slate-400 dark:text-slate-500 italic py-1">
        {!brand ? 'Сначала выберите марку и модель' : !model ? 'Выберите модель' : 'Поколения не найдены'}
      </div>
    );
  }

  const toggle = (code) => {
    const updated = selected.includes(code)
      ? selected.filter(c => c !== code)
      : [...selected, code];
    onChange(updated);
  };

  return (
    <div className="space-y-1.5">
      {generations.map((gen) => (
        <div key={gen.code} className="flex items-center space-x-2">
          <Checkbox
            id={`gen-${gen.code}`}
            checked={selected.includes(gen.code)}
            onCheckedChange={() => toggle(gen.code)}
          />
          <label
            htmlFor={`gen-${gen.code}`}
            className="text-sm text-slate-600 dark:text-slate-400 cursor-pointer flex items-center gap-1.5"
          >
            <span className="font-medium text-slate-800 dark:text-slate-200">{gen.code}</span>
            <span className="text-slate-400 dark:text-slate-500 text-xs">({gen.years})</span>
          </label>
        </div>
      ))}
    </div>
  );
}

export { generationsDB };