const generateNovelId = () => {
  return crypto.randomUUID();
}

interface ICreateIds {
  generateNovelId: ()=>string;
}

export class CreateIds {
  private static instance: ICreateIds;

    private constructor() { }

    public static getInstance(): ICreateIds {
        if (!CreateIds.instance) {
          CreateIds.instance = new CreateIds();
        }

        return CreateIds.instance;
    }

    public generateNovelId() {
        return `${generateNovelId()}`;
    }
}