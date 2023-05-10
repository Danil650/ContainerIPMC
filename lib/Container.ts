export default interface Container {
    Id: string;
    ExcelId: number;
    ContainsIn?: number | string;
    Name: string;
    ContQauntIn? : number;
    SubstQauntIn? : number;
    SubstHave?: string;
    DateCreate?: Date;
}