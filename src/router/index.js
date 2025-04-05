import { createRouter, createWebHistory } from 'vue-router'
import HistogramView from '../views/HistogramView.vue'
import BoxPlotView from '../views/BoxPlotView.vue'
import MetadataView from "../views/MetadataView.vue";
import MutationSurveillanceView from "../views/MutationSurveillanceView.vue";

const routes = [
    {
        path: '/metadata',
        name: 'Metadata',
        component: MetadataView
    },
    {
        path: '/mutation-surveillance',
        name: 'Mutation surveillance',
        component: MutationSurveillanceView
    },
    {
        path: '/histogram',
        name: 'Histogram',
        component: HistogramView
    },
    {
        path: '/box-plot',
        name: 'Box Plot',
        component: BoxPlotView
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router