import { Injectable } from "@nestjs/common";
import { AbstractModelAction } from "../../../database/utils/abtract-model.action";
import { Session } from "../entities/session.entity";

@Injectable()
export class SessionModelAction extends AbstractModelAction<Session> {
    findById(id: string): Promise<Session | null> {
        return this.get({ identifierOptions: { id } });
    }
}
