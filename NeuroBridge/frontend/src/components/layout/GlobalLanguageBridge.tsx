import { useEffect } from 'react';
import { useDyslexia } from '../../contexts/DyslexiaContext';
import { getDashboardTextTranslations } from '../../utils/translations';

// Global maps to store the true original English strings permanently
// WeakMap ensures we don't memory leak when React unmounts elements
const globalOriginalTextNodes = new WeakMap<Text, string>();
const globalOriginalAttributes = new WeakMap<Element, Map<string, string>>();

export function GlobalLanguageBridge() {
  const { language } = useDyslexia();

  useEffect(() => {
    const rootElement = document.getElementById('root') || document.body;
    if (!rootElement) return;

    const dictionary = getDashboardTextTranslations(language);
    
    // Sort phrases by length descending to replace longer phrases first
    const phrases = Object.keys(dictionary).sort((a, b) => b.length - a.length);
    
    const translateValue = (value: string) => {
      if (language === 'en') return value; // Fast path for English
      
      const trimmed = value.trim();
      if (!trimmed) return value;
      
      // Exact match check first
      if (dictionary[trimmed]) {
         return value.replace(trimmed, dictionary[trimmed]);
      }
      
      // Partial match replacement for everything else using word boundaries
      return phrases.reduce((result, phrase) => {
          if (result.includes(phrase)) {
             try {
                // Safely escape the phrase for regex and use word boundaries
                const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                const regex = new RegExp(`\\b${escaped}\\b`, 'g');
                // Test if the regex actually matches (sometimes \b fails on non-word chars)
                if (regex.test(result)) {
                    return result.replace(regex, dictionary[phrase]);
                }
             } catch (e) {
                // Ignore regex errors
             }
             // Fallback for phrases that don't play well with \b (e.g. they start/end with punctuation)
             return result.split(phrase).join(dictionary[phrase]);
          }
          return result;
      }, value);
    };

    const processTextNode = (textNode: Text) => {
        let original = globalOriginalTextNodes.get(textNode);
        if (original === undefined) {
           original = textNode.nodeValue ?? '';
           globalOriginalTextNodes.set(textNode, original);
        }
        
        const newValue = translateValue(original);
        if (textNode.nodeValue !== newValue) {
            textNode.nodeValue = newValue;
        }
    };

    const processElementAttributes = (element: Element) => {
        for (const attribute of ['placeholder', 'title', 'aria-label']) {
          const value = element.getAttribute(attribute);
          if (value === null) continue;
          
          let elementOriginals = globalOriginalAttributes.get(element);
          if (!elementOriginals) {
            elementOriginals = new Map<string, string>();
            globalOriginalAttributes.set(element, elementOriginals);
          }
          
          let original = elementOriginals.get(attribute);
          if (original === undefined) {
             original = value;
             elementOriginals.set(attribute, original);
          }
          
          const translated = translateValue(original);
          if (translated !== value) {
             element.setAttribute(attribute, translated);
          }
        }
    };

    const translateTree = (root: Node) => {
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
        acceptNode: (node) => {
           // Skip script and style tags
           if (node.parentElement && ['SCRIPT', 'STYLE'].includes(node.parentElement.tagName)) {
               return NodeFilter.FILTER_REJECT;
           }
           return NodeFilter.FILTER_ACCEPT;
        }
      });
      
      const textNodes: Text[] = [];
      let node: Node | null;
      while ((node = walker.nextNode())) textNodes.push(node as Text);

      textNodes.forEach(processTextNode);

      const elements = root instanceof Element ? [root, ...Array.from(root.querySelectorAll('*'))] : [];
      elements.forEach(processElementAttributes);
    };

    // Initial translation pass for the current language
    translateTree(rootElement);

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
             translateTree(node);
          });
        } else if (mutation.type === 'characterData') {
          const target = mutation.target as Text;
          if (target.nodeValue !== null) {
             const original = globalOriginalTextNodes.get(target);
             const expectedCurrent = original !== undefined ? translateValue(original) : null;
             
             // If the DOM value is NOT what we expect, it means React (or user) changed the text
             // Therefore it's a brand new English string that we need to capture and translate
             if (target.nodeValue !== expectedCurrent) {
                 globalOriginalTextNodes.set(target, target.nodeValue);
                 processTextNode(target);
             }
          }
        } else if (mutation.type === 'attributes') {
           const target = mutation.target as Element;
           const attributeName = mutation.attributeName;
           if (attributeName && ['placeholder', 'title', 'aria-label'].includes(attributeName)) {
               const value = target.getAttribute(attributeName);
               if (value !== null) {
                   let elementOriginals = globalOriginalAttributes.get(target);
                   const original = elementOriginals?.get(attributeName);
                   const expectedCurrent = original !== undefined ? translateValue(original) : null;
                   
                   // Same check: only update if React changed it to a new English value
                   if (value !== expectedCurrent) {
                       if (!elementOriginals) {
                           elementOriginals = new Map();
                           globalOriginalAttributes.set(target, elementOriginals);
                       }
                       elementOriginals.set(attributeName, value);
                       processElementAttributes(target);
                   }
               }
           }
        }
      });
    });

    observer.observe(rootElement, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ['placeholder', 'title', 'aria-label']
    });

    return () => {
      observer.disconnect();
    };
  }, [language]);

  return null;
}
