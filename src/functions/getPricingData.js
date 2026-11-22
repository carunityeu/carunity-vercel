import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// deno-lint-ignore no-undef
globalThis.Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { brand, model, year } = await req.json();

    if (!brand || !model || !year) {
      return Response.json({ error: 'Missing required fields: brand, model, year' }, { status: 400 });
    }

    // Find matching car(s) in Latvian price database
    let matches = await base44.asServiceRole.entities.LatvianCarPrice.filter({
      brand: brand,
      model: model,
      year: parseInt(year)
    });

    // If no exact year match, find closest year
    if (matches.length === 0) {
      const allByModel = await base44.asServiceRole.entities.LatvianCarPrice.filter({
        brand: brand,
        model: model
      });
      
      if (allByModel.length > 0) {
        // Sort by year difference and take closest
        allByModel.sort((a, b) => 
          Math.abs(a.year - parseInt(year)) - Math.abs(b.year - parseInt(year))
        );
        matches = [allByModel[0]];
      }
    }

    if (matches.length === 0) {
      return Response.json({ basePrice: null });
    }

    // Calculate average price from all matches
    const avgPrice = Math.round(
      matches.reduce((sum, car) => sum + car.price, 0) / matches.length
    );

    return Response.json({ 
      basePrice: avgPrice,
      matchCount: matches.length
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});