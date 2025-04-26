import { createRouter, createWebHistory } from 'vue-router'
import BoxPlotView from '../views/BoxPlotView.vue'
import MetadataView from "../views/MetadataView.vue";
import MutationSurveillanceView from "../views/MutationSurveillanceView.vue";
import SearchView from "../views/SearchView.vue";
import LineageSurveillanceView from "../views/LineageSurveillanceView.vue";

const routes = [
    {
        path: '/',
        redirect: '/mutation-surveillance',
    },
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
        path: '/lineage-surveillance',
        name: 'Lineage surveillance',
        component: LineageSurveillanceView
    },
    {
        path: '/search',
        name: 'Search',
        component: SearchView
    },
    {
        path: '/box-plot',
        name: 'Box Plot',
        component: BoxPlotView
    },
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router