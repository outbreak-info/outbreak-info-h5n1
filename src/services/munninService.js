const PG_BASE_URL = import.meta.env.VITE_API_BASE_URL;

async function makeRequest(endpoint) {
  const url = `${PG_BASE_URL}${endpoint}`;
  const response = await fetch(url); 
  return await response.json();
}

export async function getPhenotypeMetrics() {
  try {
    return await makeRequest("phenotype_metrics");
  } catch (error) {
    console.error(`Error fetching phenotype metrics`, error);
    return [];
  }
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

export async function getLineagesByLineageSystem(lineage_system_name)  {
  try {
    let url = `lineages?lineage_system_name=${lineage_system_name}`;
    return await makeRequest(url);
  } catch (error) {
    console.error(`Error fetching lineages count by lineage system name`, error);
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

export async function getLineageSummaryStatsBySample(q = null)  {
  try {
    let url = `lineages/abundances/summary_stats`;
    if (q !== null)
      url += `?q=${q}`;
    return await makeRequest(url);
  } catch (error) {
    console.error(`Error fetching lineage summary statistics by sample`, error);
    return [];
  }

}

async function getCountByDateBin(field="mutations", q = '', group_by = "collection_date", date_bin = 'month', days = 5, change_bin = 'aa', max_span_days = 30) {
  const validGroupBy = ['collection_date', 'release_date'];
  const validDateBins = ['month', 'year', 'day'];
  const validChangeBins = ['nt', 'aa'];
  const validFields = ['mutations', 'variants', 'lineages'];

  if (!validFields.includes(field)) {
    console.error(`Invalid field: must be one of ${validFields.join(', ')}`);
    return {};
  }

  if (!validGroupBy.includes(group_by)) {
    console.error(`Invalid group_by: must be one of ${validGroupBy.join(', ')}`);
    return {};
  }

  if (!validDateBins.includes(date_bin)) {
    console.error(`Invalid date_bin: must be one of ${validDateBins.join(', ')}`);
    return {};
  }

  if (date_bin === 'day') {
    if (typeof days !== 'number' || days < 0 || days > 30) {
      console.error(`Invalid days: must be a number between 0 and 30 when date_bin is 'day'`);
      return {};
    }
  }

  if (!validChangeBins.includes(change_bin)) {
    console.error(`Invalid change_bin: must be one of ${validChangeBins.join(', ')}`);
    return {};
  }

  if (q === '' && field !== "lineages") {
    console.error(`Invalid q: must include 'position_nt=' or 'position_aa='`);
    return {};
  }

  if (field !== "lineages" && (!(q.includes('position_nt=') || q.includes('position_aa=')))) {
    console.error(`Invalid q: must include 'position_nt=' or 'position_aa='`);
    return {};
  }


  const params = new URLSearchParams({
    group_by,
    date_bin,
    days: days.toString(),
    change_bin,
    max_span_days: max_span_days.toString()
  });

  if (q !== null && q !== '')
    params.append('q', q);

  const endpoint = `v0/${field}:count?${params.toString()}`;

  return makeRequest(endpoint);
}

function flattenVariantsOrMutationsDateBins(data) {
  const result = [];

  for (const [key, date_data] of Object.entries(data)) {
    for (const [group, value] of Object.entries(date_data)) {
      result.push({
        key: key,
        value: value,
        group: group
      });
    }
  }

  return result.sort((a, b) => a.date - b.date);
}

export async function getVariantCountByDateBin(q = '', group_by = "collection_date", date_bin = 'month', days = 5, change_bin = 'aa', max_span_days = 30)  {
  try {
    const res = await getCountByDateBin("variants",  q, group_by, date_bin, days, change_bin, max_span_days);
    return flattenVariantsOrMutationsDateBins(res);
  } catch (error) {
    console.error(`Error fetching variant counts by date bin`, error);
    return [];
  }
}

export async function getMutationCountByDateBin(q = '', group_by = "collection_date", date_bin = 'month', days = 5, change_bin = 'aa', max_span_days = 30)  {
  try {
    const res = await getCountByDateBin("mutations",  q, group_by, date_bin, days, change_bin, max_span_days);
    return flattenVariantsOrMutationsDateBins(res);
  } catch (error) {
    console.error(`Error fetching mutation counts by date bin`, error);
    return [];
  }
}

export async function getLineageCountByDateBin(q = '', group_by = "collection_date", date_bin = 'month', days = 5, change_bin = 'aa', max_span_days = 30)  {
  try {
    const res = await getCountByDateBin("lineages",  q, group_by, date_bin, days, change_bin, max_span_days);

    let result = {};
    Object.entries(res).forEach(([date, lineage_systems]) => {
      // Iterate through each method for this date
      Object.entries(lineage_systems).forEach(([lineage_system, lineages]) => {
        // Initialize method array if it doesn't exist
        if (!result[lineage_system]) {
          result[lineage_system] = [];
        }

        // Iterate through each variant and its count
        Object.entries(lineages).forEach(([lineage, count]) => {
          result[lineage_system].push({
            key: date,
            value: count,
            group: lineage
          });
        });
      });
    });

    if ("usda_genoflu" in result) {
      return result["usda_genoflu"];
    }

    // if("freyja_demixed" in result) {
    //   return result["freyja_demixed"];
    // }
    return {};
  } catch (error) {
    console.error(`Error fetching lineage counts by date bin`, error);
    return [];
  }
}

export async function getLineageMutationIncidence(lineage, lineage_system_name, change_bin="aa", q = null, min_prevalence=0.75)  {
  if(lineage === null) {
    return [];
  }
  try {
    let url = `v0/lineages:mutationIncidence`;
    url += `?lineage=${encodeURIComponent(lineage)}&change_bin=${encodeURIComponent(change_bin)}&lineage_system_name=${lineage_system_name}`;
    if(q!==null) {
      url += `&q=${q}`;
    }
    const data = await makeRequest(url);
    if (data.mutation_counts) {
      for (const gff_or_region in data.mutation_counts) {
        data.mutation_counts[gff_or_region] = data.mutation_counts[gff_or_region].map(obj => ({
          ...obj,
          lineage: lineage,
          mut: obj.ref + obj.pos + obj.alt,
          total_samples: data.sample_count
        })).sort((a,b) => a.pos - b.pos);
      }
    }
    return data;
  } catch (error) {
    console.error(`Error fetching lineage count by sample`, error);
    return [];
  }

}

export async function getVariantMutationLag(lineage, lineage_system_name) {
  try {
    const data =  await makeRequest(`variants:mutationLag?lineage=${lineage}&lineage_system_name=${lineage_system_name}`);

    for (const gff_or_region in data) {
      data[gff_or_region] = data[gff_or_region].map(obj => ({
        ...obj,
        variants_start_date: new Date(obj.variants_start_date),
        mutations_start_date: new Date(obj.mutations_start_date),
        lineage: lineage,
        mut: obj.ref + obj.pos + obj.alt,
      })).sort((a,b) => b.lag - a.lag);
    }
    return data;
  } catch (error) {
    console.error(`Error fetching variant mutation lag`, error);
    return {};
  }
}

export async function getRegionToGffFeatureMapping(intermediate) {
  if(!['variants', 'mutations'].includes(intermediate)) {
    console.error(`Intermediate needs to be "variant" or "mutation"`);
  }
  try {
    const data = await makeRequest(`${intermediate}:regionAndGffFeature`);
    return Object.fromEntries(
        data.map(({ gff_feature, region }) => [gff_feature, region])
    );
  } catch (error) {
    console.error(`Error fetching variant mutation lag`, error);
    return {};
  }
}

export async function getRegionToGffFeatureMappingForMutations() {
  return getRegionToGffFeatureMapping('mutations');
}

export async function getRegionToGffFeatureMappingForVariants() {
  return getRegionToGffFeatureMapping('variants');
}

export async function getLineageMutationProfile(lineage, lineage_system_name, q = null) {
  try {
    let url = `v0/lineages:mutationProfile?lineage=${encodeURIComponent(lineage)}&lineage_system_name=${lineage_system_name}`;
    if (q !== null)
      url += `?q=${q}`;
    const data = await makeRequest(url);
    const total_alleles = data.reduce((acc, item) => acc + item.count, 0);
    const dataByRegion = data.map(item => ({
      ...item,
      lineage: lineage,
      key: item.ref_nt + "->" + item.alt_nt,
      value: item.count/total_alleles
    })).reduce((acc, item) => {
      const key = item.region;
      (acc[key] ??= []).push(item);
      return acc;
    }, {});

    for (const arr of Object.values(dataByRegion)) {
      arr.sort((a, b) => a.key.localeCompare(b.key));
    }
    return dataByRegion;
  } catch (error) {
    console.error(`Error fetching lineage mutation profile`, error);
    return {};
  }
}

async function getPhenotypeMetricCountsForDataFieldByCollectionDate(dataField,
                                                                    phenotype_metric_name,
                                                                    phenotype_metric_value_threshold,
                                                                    q = null,
                                                                    date_bin= "month",
                                                                   max_span_days = 31) {
  if(dataField !== "Mutations" && dataField !== "Variants") {
    return [];
  }
  try {
    let url = `v0/phenotype_metric_values:count${dataField}ByCollectionDate?phenotype_metric_name=${encodeURIComponent(phenotype_metric_name)}`
    url += `&phenotype_metric_value_threshold=${encodeURIComponent(phenotype_metric_value_threshold)}`;
    url += `&date_bin=${encodeURIComponent(date_bin)}`;
    url += `&max_span_days=${encodeURIComponent(max_span_days)}`;
    if(q !== "" && q!== null)
      url += `&q=${encodeURIComponent(q)}`;
    return await makeRequest(url);
  } catch (error) {
    console.error(`Error fetching phenotype metrics by collection date`, error);
    return [];
  }
}

export async function getPhenotypeMetricCountsForMutationsByCollectionDate(phenotype_metric_name,
                                                               phenotype_metric_value_threshold,
                                                               q = null,
                                                               date_bin= "month",
                                                               max_span_days = 31,
                                                               ) {
  return await getPhenotypeMetricCountsForDataFieldByCollectionDate("Mutations", phenotype_metric_name, phenotype_metric_value_threshold, q, date_bin, max_span_days);
}

export async function getPhenotypeMetricCountsForVariantsByCollectionDate(phenotypeMetricName,
                                                                           phenotypeMetricValueThreshold,
                                                                           q = null,
                                                                           date_bin= "month",
                                                                           max_span_days = 31,
) {
  return await getPhenotypeMetricCountsForDataFieldByCollectionDate("Variants", phenotypeMetricName, phenotypeMetricValueThreshold, q, date_bin, max_span_days);
}

async function getPhenotypeMetricValueByDataFieldQuantile(dataField, phenotypeMetricName, quantile = 0.5) {
  if(dataField !== "Mutations" && dataField !== "Variants") {
    return {};
  }
  try {
    let url = `v0/phenotype_metric_values:by${dataField}Quantile?phenotype_metric_name=${encodeURIComponent(phenotypeMetricName)}`
    url += `&quantile=${encodeURIComponent(quantile)}`;
    return await makeRequest(url);
  } catch (error) {
    console.error(`Error fetching phenotype metric value by quantile`, error);
    return {};
  }
}

export async function getPhenotypeMetricValueByMutationsQuantile(phenotypeMetricName, quantile = 0.5) {
  return await getPhenotypeMetricValueByDataFieldQuantile("Mutations", phenotypeMetricName, quantile);
}

export async function getPhenotypeMetricValueByVariantsQuantile(phenotypeMetricName, quantile = 0.5) {
  return await getPhenotypeMetricValueByDataFieldQuantile("Variants", phenotypeMetricName, quantile);
}

async function getAnnotationsByDataFieldAndCollectionDate(dataField, effectDetail, q= null, dateBin= "month", days=5, maxSpanDays=31) {
  if(dataField !== "Mutations" && dataField !== "Variants") {
    return [];
  }
  if(effectDetail === null) {
    return [];
  }
  try {
    let url = `v0/annotations:by${dataField}AndCollectionDate`
    url += `?effect_detail=${encodeURIComponent(effectDetail)}`
    url += `&date_bin=${encodeURIComponent(dateBin)}`;
    url += `&days=${encodeURIComponent(days)}`;
    url += `&max_span_days=${encodeURIComponent(maxSpanDays)}`;
    if(q !== "" && q!== null)
      url += `&q=${encodeURIComponent(q)}`;
    return await makeRequest(url);
  } catch (error) {
    console.error(`Error fetching annotations metric value by ${dataField}`, error);
    return [];
  }
}

export async function getAnnotationsByMutationsAndCollectionDate(effectDetail, q= null, dateBin= "month", days=5, maxSpanDays=31) {
  return await  getAnnotationsByDataFieldAndCollectionDate("Mutations", effectDetail, q, dateBin, days, maxSpanDays)
}

export async function getAnnotationsByVariantsAndCollectionDate(effectDetail, q= null, dateBin= "month", days=5, maxSpanDays=31) {
  return await  getAnnotationsByDataFieldAndCollectionDate("Variants", effectDetail, q, dateBin, days, maxSpanDays)
}

export async function getAllAnnotationEffects() {
  try {
    let url = `v0/annotationEffects`
    return await makeRequest(url);
  } catch (error) {
    console.error(`Error fetching annotation effects`, error);
    return {};
  }
}

export async function getVariantFrequencyByCollectionDate(position_aa = "", alt_aa = "", gff_feature="", q = null, date_bin= "month", max_span_days = 31) {
  if(position_aa === "" || alt_aa === "" || gff_feature === "") {
    return [];
  }
  try {
    let url = `v0/variants:freqByCollectionDate?alt_aa=${encodeURIComponent(alt_aa)}&position_aa=${encodeURIComponent(position_aa)}&gff_feature=${encodeURIComponent(gff_feature)}`
    url += `&date_bin=${encodeURIComponent(date_bin)}`;
    url += `&max_span_days=${encodeURIComponent(max_span_days)}`;
    if(q !== "" && q!== null)
      url += `&q=${encodeURIComponent(q)}`;
    return await makeRequest(url);
  } catch (error) {
    console.error(`Error fetching phenotype metrics by collection date`, error);
    return [];
  }
}


export async function getMutationCountsByCollectionDateAndLineage(position_aa = "", alt_aa = "", gff_feature="", q = null, date_bin= "month", max_span_days = 31) {
  if(position_aa === "" || alt_aa === "" || gff_feature === "") {
    return [];
  }
  try {
    let url = `v0/mutations:countByCollectionDateAndLineage?alt_aa=${encodeURIComponent(alt_aa)}&position_aa=${encodeURIComponent(position_aa)}&gff_feature=${encodeURIComponent(gff_feature)}`
    url += `&date_bin=${encodeURIComponent(date_bin)}`;
    url += `&max_span_days=${encodeURIComponent(max_span_days)}`;
    if(q !== "" && q!== null)
      url += `&q=${encodeURIComponent(q)}`;
    return await makeRequest(url);
  } catch (error) {
    console.error(`Error fetching phenotype metrics by collection date`, error);
    return [];
  }
}

async function getAggregatePhenotypeMetricValuesForDataFieldBySampleAndCollectionDate(dataField,
                                                                    phenotype_metric_name,
                                                                    q = null,
                                                                    date_bin= "month",
                                                                    max_span_days = 31) {
  if(dataField !== "Mutations" && dataField !== "Variants") {
    return [];
  }
  try {
    let url = `v0/phenotype_metric_values:for${dataField}AggregateBySampleAndCollectionDate?phenotype_metric_name=${encodeURIComponent(phenotype_metric_name)}`
    url += `&date_bin=${encodeURIComponent(date_bin)}`;
    url += `&max_span_days=${encodeURIComponent(max_span_days)}`;
    if(q !== "" && q!== null)
      url += `&q=${encodeURIComponent(q)}`;
    return await makeRequest(url);
  } catch (error) {
    console.error(`Error fetching phenotype metrics by collection date`, error);
    return [];
  }
}

export async function getAggregatePhenotypeMetricValuesForMutationsBySampleAndCollectionDate(phenotype_metric_name,
                                                                                             q = null,
                                                                                             date_bin= "month",
                                                                                             max_span_days = 31) {
  return await getAggregatePhenotypeMetricValuesForDataFieldBySampleAndCollectionDate("Mutations",
      phenotype_metric_name,
      q = null,
      date_bin= "month",
      max_span_days = 31);
}

export async function getAggregatePhenotypeMetricValuesForVariantsBySampleAndCollectionDate(phenotype_metric_name,
                                                                                             q = null,
                                                                                             date_bin= "month",
                                                                                             max_span_days = 31) {
  return await getAggregatePhenotypeMetricValuesForDataFieldBySampleAndCollectionDate("Variants",
      phenotype_metric_name,
      q = null,
      date_bin= "month",
      max_span_days = 31);
}