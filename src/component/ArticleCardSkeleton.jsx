import { Box, Container, Divider, Card, CardContent, Skeleton, CardActions  } from "@mui/material";

function ArticleCardSkeleton() {
    return (
        <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 2 }}>
            <Skeleton variant="rectangular" sx={{ width: '100%', aspectRatio: '16/9' }} />
            <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1, flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', minHeight: 32 }}>
                    <Skeleton variant="rounded" width={40} height={18} />
                    <Skeleton variant="circular" width={24} height={24} />
                </Box>

                <Skeleton variant="text" width="90%" height={24} />
                <Skeleton variant="text" width="60%" height={24} />

                <Box sx={{ display: 'flex', gap: 0.5, height: 24 }}>
                    <Skeleton variant="rounded" width={60} height={20} />
                    <Skeleton variant="rounded" width={50} height={20} />
                </Box>

                <Divider sx={{ my: 0.5 }} />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
                    <Skeleton variant="text" width="40%" />
                    <Skeleton variant="text" width={30} />
                </Box>

                <Skeleton variant="text" width="30%" />
            </CardContent>
            <CardActions sx={{ px: 2, pb: 2, pt: 0 }}>
                <Skeleton variant="rounded" width="100%" height={32} />
            </CardActions>
        </Card>
    )
}

export default ArticleCardSkeleton