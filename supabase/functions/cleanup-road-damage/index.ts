import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NominatimLocation {
  lat: number;
  lon: number;
  road_name: string;
  city: string;
  state: string;
  district: string;
  municipality: string;
  road_category: string;
  autobahn_region?: string;
}

const LOCATIONS_TO_CORRECT: NominatimLocation[] = [
  {
    lat: 49.64662,
    lon: 11.02193,
    road_name: 'A 73',
    city: 'Baiersdorf',
    state: 'Bayern',
    district: 'Landkreis Erlangen-Höchstadt',
    municipality: 'Baiersdorf',
    road_category: 'autobahn',
    autobahn_region: 'Süd'
  },
  {
    lat: 49.77658,
    lon: 10.30691,
    road_name: 'A 3',
    city: 'Großlangheim',
    state: 'Bayern',
    district: 'Landkreis Kitzingen',
    municipality: 'Großlangheim',
    road_category: 'autobahn',
    autobahn_region: 'Süd'
  },
  {
    lat: 49.984847,
    lon: 9.808871,
    road_name: 'Karlstadterstraße',
    city: 'Eußenheim',
    state: 'Bayern',
    district: 'Landkreis Main-Spessart',
    municipality: 'Eußenheim',
    road_category: 'municipal',
  },
  {
    lat: 48.15492,
    lon: 11.58334,
    road_name: 'Leopoldstraße',
    city: 'München',
    state: 'Bayern',
    district: 'München',
    municipality: 'München',
    road_category: 'municipal',
  },
  {
    lat: 48.15465,
    lon: 11.57925,
    road_name: 'Georgenstraße',
    city: 'München',
    state: 'Bayern',
    district: 'München',
    municipality: 'München',
    road_category: 'municipal',
  },
  {
    lat: 48.15297,
    lon: 11.58489,
    road_name: 'Kaulbachstraße',
    city: 'München',
    state: 'Bayern',
    district: 'München',
    municipality: 'München',
    road_category: 'municipal',
  },
  {
    lat: 48.265419,
    lon: 11.646162,
    road_name: 'A 9',
    city: 'Garching bei München',
    state: 'Bayern',
    district: 'Landkreis München',
    municipality: 'Garching bei München',
    road_category: 'autobahn',
    autobahn_region: 'Süd'
  },
  {
    lat: 52.56762,
    lon: 12.97082,
    road_name: 'A 10',
    city: 'Wustermark',
    state: 'Brandenburg',
    district: 'Havelland',
    municipality: 'Wustermark',
    road_category: 'autobahn',
    autobahn_region: 'Ost'
  },
  {
    lat: 52.49322,
    lon: 12.96267,
    road_name: 'A 10',
    city: 'Potsdam',
    state: 'Brandenburg',
    district: 'Potsdam',
    municipality: 'Potsdam',
    road_category: 'autobahn',
    autobahn_region: 'Ost'
  },
  {
    lat: 52.45712,
    lon: 12.93760,
    road_name: 'A 10',
    city: 'Potsdam',
    state: 'Brandenburg',
    district: 'Potsdam',
    municipality: 'Potsdam',
    road_category: 'autobahn',
    autobahn_region: 'Ost'
  },
  {
    lat: 52.393444,
    lon: 12.833920,
    road_name: 'A 10',
    city: 'Werder (Havel)',
    state: 'Brandenburg',
    district: 'Potsdam-Mittelmark',
    municipality: 'Werder (Havel)',
    road_category: 'autobahn',
    autobahn_region: 'Ost'
  },
  {
    lat: 52.36697,
    lon: 12.81572,
    road_name: 'A 10',
    city: 'Kloster Lehnin',
    state: 'Brandenburg',
    district: 'Potsdam-Mittelmark',
    municipality: 'Kloster Lehnin',
    road_category: 'autobahn',
    autobahn_region: 'Ost'
  },
];

const NEW_ENTRIES: NominatimLocation[] = [
  {
    lat: 52.32869,
    lon: 12.82362,
    road_name: 'A 10',
    city: 'Kloster Lehnin',
    state: 'Brandenburg',
    district: 'Potsdam-Mittelmark',
    municipality: 'Kloster Lehnin',
    road_category: 'autobahn',
    autobahn_region: 'Ost'
  },
  {
    lat: 52.236135,
    lon: 12.917283,
    road_name: 'A 9',
    city: 'Beelitz',
    state: 'Brandenburg',
    district: 'Potsdam-Mittelmark',
    municipality: 'Beelitz',
    road_category: 'autobahn',
    autobahn_region: 'Ost'
  },
  {
    lat: 52.17525,
    lon: 12.83180,
    road_name: 'A 9',
    city: 'Niemegk',
    state: 'Brandenburg',
    district: 'Potsdam-Mittelmark',
    municipality: 'Niemegk',
    road_category: 'autobahn',
    autobahn_region: 'Ost'
  },
  {
    lat: 52.087087,
    lon: 12.676528,
    road_name: 'A 9',
    city: 'Niemegk',
    state: 'Brandenburg',
    district: 'Potsdam-Mittelmark',
    municipality: 'Niemegk',
    road_category: 'autobahn',
    autobahn_region: 'Ost'
  },
];

const FIXES = [
  {
    oldLat: 48.0700,
    oldLon: 11.4500,
    newLocation: {
      lat: 48.05215,
      lon: 11.45625,
      road_name: 'A 95',
      city: 'Forstenrieder Park',
      state: 'Bayern',
      district: 'Landkreis München',
      municipality: 'Landkreis München',
      road_category: 'autobahn',
      autobahn_region: 'Süd'
    }
  },
  {
    oldLat: 48.2500,
    oldLon: 11.5500,
    newLocation: {
      lat: 48.27005,
      lon: 11.54133,
      road_name: 'A 92',
      city: 'Unterschleißheim',
      state: 'Bayern',
      district: 'Landkreis München',
      municipality: 'Unterschleißheim',
      road_category: 'autobahn',
      autobahn_region: 'Süd'
    }
  },
];

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          persistSession: false,
        },
      }
    );

    console.log('Starting road damage data cleanup...');

    // Step 1: Get all existing entries
    const { data: existingData, error: fetchError } = await supabaseClient
      .from('road_damage')
      .select('*')
      .order('detected_at', { ascending: false });

    if (fetchError) {
      console.error('Error fetching existing data:', fetchError);
      throw fetchError;
    }

    console.log(`Found ${existingData?.length || 0} existing entries`);

    const results = {
      corrected: 0,
      added: 0,
      fixed: 0,
      errors: [] as string[],
    };

    // Step 2: Correct existing entries using LOCATIONS_TO_CORRECT
    for (const location of LOCATIONS_TO_CORRECT) {
      const matchingEntries = existingData?.filter(entry => {
        const latMatch = Math.abs(entry.latitude - location.lat) < 0.01;
        const lonMatch = Math.abs(entry.longitude - location.lon) < 0.01;
        return latMatch && lonMatch;
      });

      if (matchingEntries && matchingEntries.length > 0) {
        for (const entry of matchingEntries) {
          const { error: updateError } = await supabaseClient
            .from('road_damage')
            .update({
              latitude: location.lat,
              longitude: location.lon,
              road_name: location.road_name,
              city: location.city,
              state: location.state,
              district: location.district,
              municipality: location.municipality,
              road_category: location.road_category,
              autobahn_region: location.autobahn_region || null,
            })
            .eq('id', entry.id);

          if (updateError) {
            console.error(`Error updating entry ${entry.id}:`, updateError);
            results.errors.push(`Failed to update ${entry.id}: ${updateError.message}`);
          } else {
            console.log(`Corrected entry at ${location.lat}, ${location.lon}`);
            results.corrected++;
          }
        }
      }
    }

    // Step 3: Fix specific entries
    for (const fix of FIXES) {
      const matchingEntries = existingData?.filter(entry => {
        const latMatch = Math.abs(entry.latitude - fix.oldLat) < 0.001;
        const lonMatch = Math.abs(entry.longitude - fix.oldLon) < 0.001;
        return latMatch && lonMatch;
      });

      if (matchingEntries && matchingEntries.length > 0) {
        for (const entry of matchingEntries) {
          const { error: updateError } = await supabaseClient
            .from('road_damage')
            .update({
              latitude: fix.newLocation.lat,
              longitude: fix.newLocation.lon,
              road_name: fix.newLocation.road_name,
              city: fix.newLocation.city,
              state: fix.newLocation.state,
              district: fix.newLocation.district,
              municipality: fix.newLocation.municipality,
              road_category: fix.newLocation.road_category,
              autobahn_region: fix.newLocation.autobahn_region || null,
            })
            .eq('id', entry.id);

          if (updateError) {
            console.error(`Error fixing entry ${entry.id}:`, updateError);
            results.errors.push(`Failed to fix ${entry.id}: ${updateError.message}`);
          } else {
            console.log(`Fixed entry from ${fix.oldLat}, ${fix.oldLon} to ${fix.newLocation.lat}, ${fix.newLocation.lon}`);
            results.fixed++;
          }
        }
      }
    }

    // Step 4: Add new entries
    for (const location of NEW_ENTRIES) {
      const severities = ['low', 'medium', 'high'];
      const damageTypes = ['crack', 'pothole'];
      
      const newEntry = {
        damage_type: damageTypes[Math.floor(Math.random() * damageTypes.length)],
        severity: severities[Math.floor(Math.random() * severities.length)],
        latitude: location.lat,
        longitude: location.lon,
        road_name: location.road_name,
        city: location.city,
        state: location.state,
        district: location.district,
        municipality: location.municipality,
        road_category: location.road_category,
        autobahn_region: location.autobahn_region || null,
        confidence_score: Math.random() * 0.2 + 0.8, // 0.8 to 1.0
        detected_at: new Date().toISOString(),
        image_url: '/images/sample-pothole.jpg',
        metadata: {
          source: 'nominatim_cleanup',
          added_by: 'cleanup_function',
        },
      };

      const { error: insertError } = await supabaseClient
        .from('road_damage')
        .insert([newEntry]);

      if (insertError) {
        console.error(`Error inserting entry at ${location.lat}, ${location.lon}:`, insertError);
        results.errors.push(`Failed to add ${location.lat}, ${location.lon}: ${insertError.message}`);
      } else {
        console.log(`Added new entry at ${location.lat}, ${location.lon}`);
        results.added++;
      }
    }

    // Get final dataset
    const { data: finalData, error: finalFetchError } = await supabaseClient
      .from('road_damage')
      .select('*')
      .order('detected_at', { ascending: false });

    if (finalFetchError) {
      console.error('Error fetching final data:', finalFetchError);
      throw finalFetchError;
    }

    console.log('Cleanup completed successfully');

    return new Response(
      JSON.stringify({
        success: true,
        results,
        totalEntries: finalData?.length || 0,
        data: finalData,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in cleanup function:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
