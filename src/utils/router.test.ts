import { describe, it, expect } from 'vitest';
import { parsePath, resolvePath } from './router';

describe('router utilities', () => {
  describe('parsePath', () => {
    it('normalizes root path to home collections with redirect flag', () => {
      const emptyResult = parsePath('');
      expect(emptyResult).toEqual({
        page: 'home',
        path: '/collections',
        redirectFromRoot: true,
      });

      const rootResult = parsePath('/');
      expect(rootResult).toEqual({
        page: 'home',
        path: '/collections',
        redirectFromRoot: true,
      });
    });

    it('strips trailing slashes correctly', () => {
      const result = parsePath('/studio/');
      expect(result).toEqual({
        page: 'build',
        path: '/studio',
      });
    });

    it('correctly maps route aliases to canonical paths', () => {
      expect(parsePath('/home')).toEqual({ page: 'home', path: '/collections' });
      expect(parsePath('/collections')).toEqual({ page: 'home', path: '/collections' });

      expect(parsePath('/about')).toEqual({ page: 'about', path: '/our-story' });
      expect(parsePath('/design')).toEqual({ page: 'about', path: '/our-story' });
      expect(parsePath('/our-story')).toEqual({ page: 'about', path: '/our-story' });

      expect(parsePath('/build')).toEqual({ page: 'build', path: '/studio' });
      expect(parsePath('/studio')).toEqual({ page: 'build', path: '/studio' });
    });

    it('handles static content and account routes', () => {
      expect(parsePath('/terracare')).toEqual({ page: 'terracare', path: '/terracare' });
      expect(parsePath('/faq')).toEqual({ page: 'faq', path: '/faq' });
      expect(parsePath('/account')).toEqual({ page: 'account', path: '/account' });
      expect(parsePath('/checkout')).toEqual({ page: 'build', path: '/studio' });
      expect(parsePath('/payments')).toEqual({ page: 'build', path: '/studio' });
    });

    it('parses valid edition detail routes', () => {
      expect(parsePath('/editions/cloud_forest')).toEqual({
        page: 'edition',
        path: '/editions/cloud_forest',
        editionId: 'cloud_forest',
      });

      expect(parsePath('/edition/fern_study')).toEqual({
        page: 'edition',
        path: '/editions/fern_study',
        editionId: 'fern_study',
      });

      expect(parsePath('/editions/moss_garden')).toEqual({
        page: 'edition',
        path: '/editions/moss_garden',
        editionId: 'moss_garden',
      });
    });

    it('falls back to cloud_forest for invalid edition keys', () => {
      expect(parsePath('/editions/non_existent_key')).toEqual({
        page: 'edition',
        path: '/editions/cloud_forest',
        editionId: 'cloud_forest',
      });
    });

    it('falls back to collections for unknown paths', () => {
      expect(parsePath('/completely/unknown/page')).toEqual({
        page: 'home',
        path: '/collections',
      });
    });
  });

  describe('resolvePath', () => {
    it('resolves root target to collections', () => {
      expect(resolvePath('/')).toEqual({ path: '/collections', redirectFromRoot: true });
      expect(resolvePath('')).toEqual({ path: '/collections', redirectFromRoot: true });
    });

    it('resolves named page targets to canonical routes', () => {
      expect(resolvePath('home')).toEqual({ path: '/collections' });
      expect(resolvePath('build')).toEqual({ path: '/studio' });
      expect(resolvePath('about')).toEqual({ path: '/our-story' });
      expect(resolvePath('design')).toEqual({ path: '/our-story' });
      expect(resolvePath('terracare')).toEqual({ path: '/terracare' });
      expect(resolvePath('faq')).toEqual({ path: '/faq' });
      expect(resolvePath('account')).toEqual({ path: '/account' });
    });

    it('resolves edition targets with custom editionId params', () => {
      expect(resolvePath('edition', { editionId: 'fern_study' })).toEqual({
        path: '/editions/fern_study',
      });

      expect(resolvePath('edition')).toEqual({
        path: '/editions/cloud_forest',
      });
    });

    it('resolves arbitrary paths through parsePath normalization', () => {
      expect(resolvePath('/about')).toEqual({ path: '/our-story' });
      expect(resolvePath('/build/')).toEqual({ path: '/studio' });
    });
  });
});
