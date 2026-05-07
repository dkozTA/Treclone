import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Button } from '../ui/button';

describe('Button Component - CSS Loading Verification', () => {
  // This test suite verifies that the Button component correctly applies the design system's CSS classes for styling, including gradients, border radius, and text color.
  //
  it('should render button with design system classes', () => {
    const { container } = render(
      <Button variant="default" size="default">
        Test Button
      </Button>
    );

    const button = container.querySelector('button');
    expect(button).toBeTruthy();
    expect(button?.textContent).toBe('Test Button');
  });

  it('should apply gradient colors from design system', () => {
    const { container } = render(
      <Button variant="default">Primary Gradient</Button>
    );

    const button = container.querySelector('button');
    // Check if gradient classes are applied
    expect(button?.className).toContain('from-primary');
    expect(button?.className).toContain('to-primary-container');
  });

  it('should apply rounded-sm (12px) border radius', () => {
    const { container } = render(<Button>Rounded Button</Button>);

    const button = container.querySelector('button');
    expect(button?.className).toContain('rounded-sm');
  });

  it('should have text-on-primary foreground', () => {
    const { container } = render(<Button variant="default">Text Color</Button>);

    const button = container.querySelector('button');
    expect(button?.className).toContain('text-on-primary');
  });

  it('should render with outline variant and hairline-ghost border', () => {
    const { container } = render(
      <Button variant="outline">Outline Button</Button>
    );

    const button = container.querySelector('button');
    expect(button?.className).toContain('border');
    expect(button?.className).toContain('hairline-ghost');
  });

  it('should support different sizes', () => {
    const { container: containerXs } = render(
      <Button size="xs">XS Button</Button>
    );

    const { container: containerLg } = render(
      <Button size="lg">LG Button</Button>
    );

    expect(containerXs.querySelector('button')?.className).toContain('h-7');
    expect(containerLg.querySelector('button')?.className).toContain('h-11');
  });
});
