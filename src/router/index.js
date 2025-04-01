import { createRouter, createWebHistory } from 'vue-router'
import IsolationSourceView from '../views/IsolationSourceView.vue'
import HostSourceView from '../views/HostSourceView.vue'
import ReleaseDateView from '../views/ReleaseDateView.vue'
import DMSView from '../views/DMSView.vue'
import HistogramView from '../views/HistogramView.vue'
import BoxPlotView from '../views/BoxPlotView.vue'

const routes = [
    {
        path: '/',
        name: 'ReleaseDate',
        component: ReleaseDateView
    },
    {
        path: '/isolation-source',
        name: 'IsolationSource',
        component: IsolationSourceView
    },
    {
        path: '/host-source',
        name: 'HostSource',
        component: HostSourceView
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
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router