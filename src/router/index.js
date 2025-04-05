import { createRouter, createWebHistory } from 'vue-router'
import DMSView from '../views/DMSView.vue'
import HistogramView from '../views/HistogramView.vue'
import BoxPlotView from '../views/BoxPlotView.vue'
import MutationView from '../views/MutationView.vue'
import MetadataView from "../views/MetadataView.vue";

const routes = [
    {
        path: '/metadata',
        name: 'Metadata',
        component: MetadataView
    },
    {
        path: '/dms',
        name: 'DMS',
        component: DMSView
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
    },
    {
        path: '/mutations',
        name: 'mutations',
        component: MutationView
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router