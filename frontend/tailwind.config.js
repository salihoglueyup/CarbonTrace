/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                bbva: {
                    green: '#00874A',
                    'green-dark': '#006837',
                    'green-light': '#00A85A',
                    blue: '#004481',
                    'blue-light': '#1464A5',
                    orange: '#F39200',
                    'orange-light': '#F5A623',
                },
                dark: '#1D252C',
            },
        },
    },
    plugins: [],
}
