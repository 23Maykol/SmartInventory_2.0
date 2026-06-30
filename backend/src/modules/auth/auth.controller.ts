import { Request, Response, NextFunction } from 'express'
import { AuthService } from './auth.service'

export class AuthController {
    private service: AuthService

    constructor() {
        this.service = new AuthService()
    }

// Public registration endpoint removed – user creation is handled via admin routes

    register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const user = await this.service.register(req.body)
            res.status(201).json({
                ok: true,
                message: 'Usuario registrado exitosamente',
                data: user
            })
        } catch (error) {
            next(error)
        }
    }


    login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const result = await this.service.login(req.body)
            res.status(200).json({
                ok: true,
                message: 'Login exitoso',
                data: result
            })
        } catch (error) {
            next(error)
        }
    }

    googleLogin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { credential } = req.body;
            if (!credential) {
                res.status(400).json({ ok: false, message: 'Falta el token de Google' });
                return;
            }
            const result = await this.service.googleLogin(credential);
            res.status(200).json({
                ok: true,
                message: 'Login con Google exitoso',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    me = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            res.status(200).json({
                ok: true,
                message: 'Usuario autenticado',
                data: req.user
            })
        } catch (error) {
            next(error)
        }
    }
}