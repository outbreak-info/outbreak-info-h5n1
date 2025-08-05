import { createRouter, createWebHistory } from 'vue-router'
import MetadataView from "../views/MetadataView.vue";
import MutationSurveillanceView from "../views/MutationSurveillanceView.vue";
import LineageSurveillanceView from "../views/LineageSurveillanceView.vue";
import LineageComparisonView from "../views/LineageComparisonView.vue";
import VariantMutationSurveillanceView from "../views/VariantMutationSurveillanceView.vue";

const routes = [
    {
        path: '/',
        redirect: '/mutation-surveillance',
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
        path: '/lineage-comparison',
        name: 'Lineage comparison',
        component: LineageComparisonView
    },
    {
        path: '/metadata',
        name: 'Metadata',
        component: MetadataView
    },
    {
        path: '/integrated-surveillance',
        name: 'Integrated surveillance',
        component: VariantMutationSurveillanceView
    },
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router