import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { Controller, Get, Param, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import isMobile from 'is-mobile';

import { Config, DocNotFound } from '../../fundamentals';
import { htmlSanitize } from '../../native';
import { PermissionService } from '../permission';
import { PageDocContent } from '../utils/blocksuite';
import { DocContentService } from './service';

interface RenderOptions {
  og: boolean;
  content: boolean;
  assets: HtmlAssets;
}

interface HtmlAssets {
  css: string[];
  js: string[];
  publicPath: string;
  gitHash?: string;
}

@Controller('/workspace/:workspaceId/:docId')
export class DocRendererController {
  private readonly webAssets: HtmlAssets = {
    js: [],
    css: [],
    publicPath: '/',
  };

  private readonly mobileAssets: HtmlAssets = {
    js: [],
    css: [],
    publicPath: '/',
  };

  constructor(
    private readonly doc: DocContentService,
    private readonly permission: PermissionService,
    private readonly config: Config
  ) {
    const webConfigMapsPath = '/app/web-assets-manifest.json';
    const mobileConfigMapsPath = '/app/mobile-assets-manifest.json';
    const webAssetsConfigPath = join(
      process.cwd(),
      'static/web-assets-manifest.json'
    );
    const mobileAssetsConfigPath = join(
      process.cwd(),
      'static/mobile/mobile-assets-manifest.json'
    );
    switch (this.config.type) {
      case 'affine':
        if (existsSync(webConfigMapsPath)) {
          this.webAssets = JSON.parse(readFileSync(webConfigMapsPath, 'utf-8'));
        }
        if (existsSync(mobileConfigMapsPath)) {
          this.mobileAssets = JSON.parse(
            readFileSync(mobileConfigMapsPath, 'utf-8')
          );
        }
        break;
      case 'selfhosted':
        if (existsSync(webAssetsConfigPath)) {
          this.webAssets = JSON.parse(
            readFileSync(webAssetsConfigPath, 'utf-8')
          );
        }

        if (existsSync(mobileAssetsConfigPath)) {
          this.mobileAssets = JSON.parse(
            readFileSync(mobileAssetsConfigPath, 'utf-8')
          );
        }
        break;
    }
  }

  @Get()
  async render(
    @Req() req: Request,
    @Res() res: Response,
    @Param('workspaceId') workspaceId: string,
    @Param('docId') docId: string
  ) {
    if (workspaceId === docId) {
      throw new DocNotFound({ spaceId: workspaceId, docId });
    }

    // if page is public, show all
    // if page is private, but workspace public og is on, show og but not content
    const opts: RenderOptions = {
      og: false,
      content: false,
      assets:
        // only enable mobile entry rendering for dev environment
        this.config.AFFINE_ENV === 'dev' &&
        isMobile({ ua: req.headers['user-agent'] ?? undefined })
          ? this.mobileAssets
          : this.webAssets,
    };
    const isPagePublic = await this.permission.isPublicPage(workspaceId, docId);

    if (isPagePublic) {
      opts.og = true;
      opts.content = true;
    } else {
      const allowPreview = await this.permission.allowUrlPreview(workspaceId);

      if (allowPreview) {
        opts.og = true;
      }
    }

    let docContent: PageDocContent | null = null

    if (opts.og) {
      docContent = await this.doc.getPageContent(workspaceId, docId);

      if (!docContent) {
        throw new DocNotFound({ spaceId: workspaceId, docId });
      }
    }

    if (!docContent) {
      docContent = { title: '', summary: '' };
    }

    res.setHeader('Content-Type', 'text/html');
    if (!opts.og) {
      res.setHeader('X-Robots-Tag', 'noindex');
    }
    res.send(this._render(docContent, opts));
  }

  _render(doc: PageDocContent, { og, assets }: RenderOptions): string {
    const title = doc.title? htmlSanitize(`${doc.title} | AFFiNE`) : 'AFFiNE';
    const summary = htmlSanitize(doc.summary);

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1, maximum-scale=1"
          />
          <title>${title} | AFFiNE</title>
          <meta name="theme-color" content="#fafafa" />
          <link rel="preconnect" href="${assets.publicPath}">
          <link rel="manifest" href="/manifest.json" />
          <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
          <link rel="icon" sizes="192x192" href="/favicon-192.png" />
          <meta name="emotion-insertion-point" content="" />
          ${!og ? '<meta name="robots" content="noindex, nofollow" />' : ''}
          <meta
            name="twitter:title"
            content="${title}"
          />
          <meta name="twitter:description" content="${summary}" />
          <meta name="twitter:site" content="@AffineOfficial" />
          <meta name="twitter:image" content="https://affine.pro/og.jpeg" />
          <meta property="og:title" content="${title}" />
          <meta property="og:description" content="${summary}" />
          <meta property="og:image" content="https://affine.pro/og.jpeg" />
          ${assets.css.map(url => `<link rel="stylesheet" href="${url}" />`).join('\n')}
        </head>
        <body>
          <div id="app" data-version="${assets.gitHash}"></div>
          ${assets.js.map(url => `<script type="module" src="${url}"></script>`).join('\n')}
        </body>
      </html>
    `;
  }
}
