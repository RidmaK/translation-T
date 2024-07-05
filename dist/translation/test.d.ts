declare const saveData: {
    id: number;
    fields: {
        filedName: string;
        text: string;
        output: string;
        status: string;
    }[];
    status: string;
    locale: string;
};
interface BlogCategory {
    id: number;
    name: string;
    slug: string;
    description: string;
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
    locale: string;
    search_rank: number | null;
}
interface SEO {
    id: number;
    seo_title: string;
    seo_description: string;
    seo_robots: string;
    canonical: string | null;
    og_type: string;
    twitter_card: string;
    keywords: string;
    seo_thumbnail: string | null;
    meta_social: any[];
    video_structured_data: any | null;
}
interface ComingData {
    id: number;
    title: string;
    content: string;
    editors_note: string;
    blog_category: BlogCategory;
    seo: SEO;
}
interface Field {
    filedName: string;
    text: string;
    output: string;
    status: string;
}
interface SaveData {
    id: number;
    fields: Field[];
    status: string;
    locale: string;
}
declare const transformData: (comingData: any) => SaveData;
declare const comingData: ComingData;
declare const savedData: SaveData;
