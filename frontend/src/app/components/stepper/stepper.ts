import { CdkStepper } from '@angular/cdk/stepper';
import { NgTemplateOutlet } from '@angular/common';
import { Component, forwardRef, input, OnInit } from '@angular/core';

@Component({
  selector: 'app-stepper',
  imports: [NgTemplateOutlet],
  providers: [{ provide: CdkStepper, useExisting: forwardRef(() => Stepper) }],
  templateUrl: './stepper.html',
  styleUrl: './stepper.css',
})
export class Stepper extends CdkStepper implements OnInit {
  readonly linearModeSelected = input(false);

  ngOnInit(): void {
    this.linear = this.linearModeSelected();
  }

  onClick(index: number) {
    this.selectedIndex = index;
  }
}