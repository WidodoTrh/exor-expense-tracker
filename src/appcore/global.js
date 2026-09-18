class global {

    static formatDateLocal(date) {
        const d = date instanceof Date ? date : new Date(date);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }

    static formatRp(val) {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
        }).format(val || 0);
    }

    static ftpServe(param='') {
        return import.meta.env.VITE_APP_URL_FTP + param;
    }
    
    static parseApiError(error) {
        const detail = error?.data?.detail

        if (Array.isArray(detail)) {
            const fieldErrors = {}

            detail.forEach((err) => {
                const field = err.loc?.[err.loc.length - 1]

                if (field) {
                    fieldErrors[field] = err.msg
                }
            })

            return {
                type: 'validation',
                fieldErrors,
                message: 'Please check field errors'
            }
        }

        return {
            type: 'error',
            fieldErrors: {},
            message: detail?.[0]?.msg || 'Something went wrong'
        }
    }
}


export default global;