// TODO: Generalize the storage of these labels
export const phenotypeMetricLabels = {
    "entry_in_293t_cells": "Entry in 293T cells",
    "sa26_usage_increase": "Increase in a2,6 sialic acid usage",
    "mouse_sera_escape": "Neutralization escape cause for mouse sera",
    "stability": "HA stability",
    "ferret_sera_escape": "Neutralization escape cause for ferret sera",
    "evescape_sigmoid": "EVE",
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
    }
}

export const defaultValues = {
    effectDetail: {
        label: "Increased virus binding to α2-6",
        value: "Increased virus binding to α2-6"
    },
    phenotypeScore: {
        label: "Increase in a2,6 sialic acid usage",
        value: "sa26_usage_increase"
    }
}