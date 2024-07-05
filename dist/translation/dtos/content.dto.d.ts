export interface FieldDto {
    fieldName: string;
    text: string;
    output: string;
    status: 'PENDING' | 'COMPLETED';
}
export interface ContentDto {
    _id: string;
    contentId: string;
    fields: FieldDto[];
}
