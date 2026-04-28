// TODO: Generalize the storage of these labels
export const phenotypeMetricLabels = {
    "sa26_usage_increase_new": "HA: Increase in a2,6 sialic acid usage",
    "entry_in_293t_cells": "HA: Entry in 293T cells",
    // "sa26_usage_increase": "Increase in a2,6 sialic acid usage",
    "mouse_sera_escape": "HA: Neutralization escape cause for mouse sera",
    "stability": "HA: stability",
    "ferret_sera_escape": "HA: Neutralization escape cause for ferret sera",
    "evescape_sigmoid": "HA: EVE",
    "entry_in_sa26_and_sa23_293t_cells": "HA: Entry in a2,6 and 2,3 sialic acid 293T cells",
    "entry_in_neuac": "HA: Entry in NeuAc 293T cells",
    "entry_in_neugc": "HA: Entry in NeuGc 293T cells",
    "neugc_usage_increase": "HA: Increase in NeuGc receptor usage",
    "mutdiffsel": "PB2: Mutational differential selection"
}

export const phenotypeMetricAxesLabels = {
    "entry_in_293t_cells": {
        minXLabel: "Impaired entry in 293T cells",
        maxXLabel: "Improved entry in 293T cells",
        showMinMaxXLabels: true,
    },
    "sa26_usage_increase": {
        showMinMaxXLabels: false,
        xLabel: "Increase in a2,6 sialic acid usage"
    },
    "sa26_usage_increase_new": {
        showMinMaxXLabels: false,
        xLabel: "Increase in a2,6 sialic acid usage"
    },
    "stability": {
        showMinMaxXLabels: false,
        xLabel: "Increase in HA stability"
    },
    "mouse_sera_escape": {
        showMinMaxXLabels: false,
        xLabel: "Increase in neutralization escape for mouse sera"
    },
    "ferret_sera_escape": {
        showMinMaxXLabels: false,
        xLabel: "Increase in neutralization escape for ferret sera"
    },
    "evescape_sigmoid": {
        showMinMaxXLabels: false,
        xLabel: "Increase in predicted fitness"
    },
    "entry_in_neuac": {
        showMinMaxXLabels: false,
        xLabel: "Entry in NeuAc 293T cells"
    },
    "entry_in_neugc": {
        showMinMaxXLabels: false,
        xLabel: "Entry in NeuGc 293T cells"
    },
    "neugc_usage_increase": {
        showMinMaxXLabels: false,
        xLabel: "Increase in NeuGc receptor usage"
    },
    "mutdiffsel": {
        showMinMaxXLabels: false,
        xLabel: "PB2 Mutational differential selection"
    }
}

export const defaultValues = {
    effectDetail: {
        label: "Increased virus binding to α2-6",
        value: "Increased virus binding to α2-6"
    },
    phenotypeScore: {
        label: "Increase in a2,6 sialic acid usage",
        value: "sa26_usage_increase_new"
    }
}
