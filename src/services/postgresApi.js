const PG_BASE_URL = "http://kenny:8000/";

async function makeRequest(endpoint) {
  const url = `${PG_BASE_URL}${endpoint}`;
  const response = await fetch(url); 
  return await response.json();
}

export async function getSampleCountByField(field = "host", size = null){
  try {
    const data = await makeRequest(`count/samples/by/${field}`);

    let formattedData = Array.isArray(data)
        ? data.map(item => ({ key: item[0], value: item[1] }))
        : Object.entries(data).map(([key, value]) => ({ key, value }));

    formattedData = formattedData
        .sort((a, b) => b.value - a.value);
    if(size !== null){
      formattedData = formattedData.slice(0, size);
    }
    return formattedData;

  } catch (error) {
    return[];
  }
}

export async function getSampleReleaseDate() {
  try {
    const data = await makeRequest("count/samples/by/release_date");
    
    const formattedData = Array.isArray(data) 
      ? data.map(item => ({ key: item[0], value: item[1] }))
      : Object.entries(data).map(([key, value]) => ({ key, value }));
    
    return formattedData.filter(item => item.key && !isNaN(new Date(item.key)));
  } catch (error) {
    return[];
  }
}

export async function getMutationFrequency(aa, nt = '') {
  try {
    let endpoint = `mutations/frequency?aa=${encodeURIComponent(aa)}`;

    if (nt) {
      endpoint += `&nt=${encodeURIComponent(nt)}`;
    }

    const data = await makeRequest(endpoint);

    if (!Array.isArray(data)) {
      return [];
    }

    return data.map(item => ({
      frequency: item.sample_count || 0
    }));
  } catch (error) {
    return [];
  }
}

export async function getVariantFrequency(aa, nt = '') {
  try {
    let endpoint = `variants/frequency?aa=${encodeURIComponent(aa)}`;
    
    if (nt) {
      endpoint += `&nt=${encodeURIComponent(nt)}`;
    }
    
    const data = await makeRequest(endpoint);
    
    if (!Array.isArray(data)) {
      return [];
    }
    
    return data.map(item => ({
      sra_id: item.accession || 'Unknown',
      frequency: item.alt_freq || 0
    }));
  } catch (error) {
    return [];
  }
}

export async function getCountByPhenotypeScore(region, metric, q = null, field = "variants")  {
  try {
    let url = `${field}/frequency/score?region=${region}&metric=${metric}`;
    if(q !== null) {
      url += `&q=${q}`;
    }
    const data = await makeRequest(url);

    return data.map(item => ({
      key: item.ref_aa + item.position_aa + item.alt_aa,
      phenotypeScore: item.pheno_value,
      count: item.count
    }));
  } catch (error) {
    console.error(`Error fetching ${field} count by score`, error);
    return [];
  }
}

export async function getLineageCountBySample(q = null)  {
  try {
    let url = `count/samples/lineages`;
    if (q !== null)
      url += `?q=${q}`;
    const data = await makeRequest(url);

    return data.map(item => ({
      lineage: item.lineage,
      lineage_system: item.lineage_system,
      count: item.count
    }));
  } catch (error) {
    console.error(`Error fetching lineage count by sample`, error);
    return [];
  }

}